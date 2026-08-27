import type { MeetingActionFixture } from "./types.js";
import { statusIs, dueDateIsUnknownFor } from "../assertions.js";

const transcript = `Owen: Can you get the migration script ready by next Monday?
Priya: Sure, I'll have it ready by next Monday.
Owen: Great, thanks.`;

export const incompleteNoMeetingDateSupplied: MeetingActionFixture = {
  name: "incomplete-no-meeting-date-supplied",
  input: { transcript },
  assertions: [
    statusIs("complete"),
    dueDateIsUnknownFor("migration script"),
    (result) => {
      const item = result.output?.action_items.find((a) =>
        a.action.toLowerCase().includes("migration script")
      );
      return {
        pass: item?.owner === "Priya",
        message: `expected migration-script action owned by Priya, got ${JSON.stringify(item)}`,
      };
    },
  ],
};
