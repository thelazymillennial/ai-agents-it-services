import type { MeetingActionFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const transcript = `Sam: This is just a quick knowledge-sharing call, no decisions today.
Sam: Question - does the billing service retry failed webhooks?
Alex: Yes, it retries three times with exponential backoff.
Sam: Good to know. That's all for today.`;

export const normalNoActionsJustFaq: MeetingActionFixture = {
  name: "normal-no-actions-just-faq",
  input: { transcript, metadata: { date: "2026-08-24", title: "Knowledge share" } },
  assertions: [
    statusIs("complete"),
    (result) => ({
      pass: (result.output?.decisions.length ?? 0) === 0,
      message: `expected no decisions, got ${result.output?.decisions.length ?? 0}`,
    }),
    (result) => ({
      pass: (result.output?.action_items.length ?? 0) === 0,
      message: `expected no action items, got ${result.output?.action_items.length ?? 0}`,
    }),
    (result) => ({
      pass: (result.output?.summary.length ?? 0) > 0,
      message: "expected a non-empty summary",
    }),
  ],
};
