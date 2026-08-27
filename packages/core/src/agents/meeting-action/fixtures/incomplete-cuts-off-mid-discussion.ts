import type { MeetingActionFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const transcript = `Nina: Okay so the payment retry logic - we need to decide whether to`;

export const incompleteCutsOffMidDiscussion: MeetingActionFixture = {
  name: "incomplete-cuts-off-mid-discussion",
  input: { transcript, metadata: { date: "2026-08-24" } },
  assertions: [
    statusIs("complete"),
    (result) => ({
      pass: (result.output?.decisions.length ?? 0) === 0,
      message: `expected no decisions from a cut-off discussion, got ${result.output?.decisions.length ?? 0}`,
    }),
    (result) => ({
      pass: (result.output?.action_items.length ?? 0) === 0,
      message: `expected no action items from a cut-off discussion, got ${result.output?.action_items.length ?? 0}`,
    }),
    (result) => {
      const mentionsPaymentRetry = result.output?.open_questions.some((q) =>
        q.toLowerCase().includes("payment") || q.toLowerCase().includes("retry")
      );
      return {
        pass: !!mentionsPaymentRetry,
        message: `expected an open question about the payment retry logic discussion, got ${JSON.stringify(result.output?.open_questions)}`,
      };
    },
  ],
};
