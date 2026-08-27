import type { MeetingActionFixture } from "./types.js";
import { statusIs, dueDateIsUnknownFor } from "../assertions.js";

const transcript = `Ravi: The API docs update needs to be done by end of this week.
Mia: Wait, I thought we agreed it was due end of next week, not this week.
Ravi: Hmm, let's just flag that we need to confirm with the team lead.`;

export const contradictoryConflictingDueDates: MeetingActionFixture = {
  name: "contradictory-conflicting-due-dates",
  input: { transcript, metadata: { date: "2026-08-24" } },
  assertions: [
    statusIs("complete"),
    dueDateIsUnknownFor("api docs"),
    (result) => {
      const mentionsDateConflict = result.output?.open_questions.some((q) =>
        q.toLowerCase().includes("api docs") || q.toLowerCase().includes("due date") || q.toLowerCase().includes("week")
      );
      return {
        pass: !!mentionsDateConflict,
        message: `expected an open question about the conflicting api docs due dates, got ${JSON.stringify(result.output?.open_questions)}`,
      };
    },
  ],
};
