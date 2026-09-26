# Give Calendly no-shows an owner and a next step

A Calendly no-show creates a follow-up task on the matching HubSpot contact, giving the sales owner the meeting context and reschedule link in one place.

Calendly starts the automation when someone marks an invitee as a no-show. It searches HubSpot for the invitee's email. If exactly one contact matches, it creates a task for the follow-up owner you choose, attaches the task to that contact, and includes the Calendly event and reschedule links.

If the email has no HubSpot match or more than one, Slack asks a teammate to review it. Nobody receives an automatic reschedule email from this example. The owner checks earlier conversations and decides whether another invitation makes sense.

## Set it up with a coding agent

Copy the setup prompt from [the article](https://automate.ax/articles/calendly-no-show-owner-task) into your coding agent. The agent creates the Automate.ax project, asks for your choices, guides account authorization, checks the automation, and deploys it. You do not need to clone this repository yourself when using the prompt.

You'll choose:

- The Calendly organization whose no-show marks should start the automation.
- The HubSpot owner who receives follow-up tasks and the task-to-contact association type ID.
- The Slack conversation for emails that cannot be matched to one contact.
- Account authorization.

The agent will set up the Automate.ax project, ask you to connect Calendly, HubSpot, and a paid Slack workspace, and help find the organization URL and HubSpot association type.

## Manual setup

If you prefer to set it up yourself:

```sh
git clone https://github.com/SentsCo/automate-ax-calendly-no-show-owner-task.git
cd automate-ax-calendly-no-show-owner-task
bun install
bunx automate.ax login
bunx automate.ax init
bun run typecheck
bunx automate.ax deploy
```

Connect the accounts requested by Automate.ax when you deploy. The platform stores credentials outside this repository. Set any project parameters requested by the automation, then review the read and write operations before turning it on.

## Check a run

Mark an untracked disposable invitee as a no-show. Confirm that one matching HubSpot contact gets one task with the correct reschedule link. Test an unmatched email and confirm Slack receives a review message instead of a task.

## Limits

- This starts after someone marks an invitee as a no-show in Calendly. It does not detect attendance on a video call or prevent a no-show.
- Matching uses the invitee's email and requires exactly one HubSpot contact. A booking under another email goes to review.
- The task goes to one configured HubSpot owner, regardless of who hosted the meeting. Change the assignment rule if different hosts should own their own tasks.
- A repeated no-show mark or event may create another task. The owner should check the contact's task history before reaching out.

The workflow responds to [a real problem described by A sales team's meeting no-show problem on Reddit](https://www.reddit.com/r/sales/comments/poopg0/how_to_improve_noshow_rates/). The public report informed the example; it is not an endorsement of this implementation.
