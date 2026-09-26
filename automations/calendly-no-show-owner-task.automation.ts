import { automation, t } from "automate.ax"
import { calendly } from "automate.ax/calendly"
import { hubspot } from "automate.ax/hubspot"
import { slack } from "automate.ax/slack"

export default automation(
  "Assign a follow-up task for Calendly no-shows",
  {
    parameters: [
      {
        label: "Calendly organization URL",
        name: "organizationUri",
        type: "url",
      },
      {
        label: "HubSpot follow-up owner ID",
        name: "followUpOwnerId",
        type: "text",
      },
      {
        label: "HubSpot task-to-contact association type ID",
        name: "taskContactAssociationTypeId",
        type: "number",
      },
      {
        label: "Slack review conversation ID",
        name: "reviewConversationId",
        type: "text",
      },
    ],
  },
  ({ parameters }) => {
    const noShow = calendly.onInviteeNoShowCreated({
      organizationUri: parameters.organizationUri,
      scope: "organization",
    })
    const search = hubspot.searchContacts({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: noShow.payload.email,
            },
          ],
        },
      ],
      limit: 2,
    })
    const match = search.transform(noShow, (page, event) => ({
      email: event.payload.email,
      name: event.payload.name,
      rescheduleUrl: event.payload.rescheduleUrl,
      eventUrl: event.payload.scheduledEvent.uri,
      markedAt: event.payload.noShow?.createdAt ?? event.payload.createdAt,
      contacts: page.records,
      hasMore: page.pageInfo.after !== undefined,
    }))
    const ambiguous = match.filter(
      ({ contacts, hasMore }) => contacts.length !== 1 || hasMore,
    )
    slack.sendMessage({
      conversation: parameters.reviewConversationId,
      text: t`Review Calendly no-show for ${ambiguous.email}: ${ambiguous.contacts.transform((contacts) => contacts.length)} HubSpot contacts matched. Event: ${ambiguous.eventUrl}. No contact task was created.`,
    })

    const resolved = match.filter(
      ({ contacts, hasMore }) => contacts.length === 1 && !hasMore,
    )
    hubspot.createTask({
      timestamp: resolved.markedAt.transform((value) => new Date(value)),
      ownerId: parameters.followUpOwnerId,
      subject: t`Review no-show follow-up for ${resolved.name}`,
      body: t`Invitee: ${resolved.email}\nCalendly event: ${resolved.eventUrl}\nReschedule link: ${resolved.rescheduleUrl}\nCheck prior contact history before reaching out.`,
      taskType: "TODO",
      associations: [
        {
          toRecordId: resolved.contacts.transform(
            (contacts) => contacts[0]!.id,
          ),
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: parameters.taskContactAssociationTypeId,
            },
          ],
        },
      ],
    })
  },
)
