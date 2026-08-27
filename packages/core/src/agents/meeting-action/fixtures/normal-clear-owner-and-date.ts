import type { MeetingActionFixture } from "./types.js";
import { statusIs, everyActionItemHasEvidence, actionItemCountAtLeast } from "../assertions.js";

const transcript = `Priya: Let's do the weekly sync. First up, the staging deploy.
Priya: Rahul, can you own updating the deploy script by this Friday, August 28th?
Rahul: Sure, I'll have the deploy script updated by Friday, August 28th.
Priya: Great. Second item, the client asked about the new reporting dashboard.
Priya: We decided to ship the dashboard behind a feature flag first.
Priya: Any blockers?
Rahul: None from my side.
Priya: Okay, let's wrap up here.`;

export const normalClearOwnerAndDate: MeetingActionFixture = {
  name: "normal-clear-owner-and-date",
  input: { transcript, metadata: { date: "2026-08-24", title: "Weekly sync" } },
  assertions: [
    statusIs("complete"),
    actionItemCountAtLeast(1),
    everyActionItemHasEvidence(),
    (result) => {
      const item = result.output?.action_items.find((a) =>
        a.action.toLowerCase().includes("deploy script")
      );
      return {
        pass: item?.owner === "Rahul" && !!item?.due_date.includes("28"),
        message: `expected deploy-script action owned by Rahul with a due date mentioning "28" (matching "Friday, August 28th" from the transcript), got ${JSON.stringify(item)}`,
      };
    },
  ],
};
