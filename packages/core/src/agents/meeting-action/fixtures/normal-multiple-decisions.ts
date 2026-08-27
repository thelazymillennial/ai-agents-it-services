import type { MeetingActionFixture } from "./types.js";
import { statusIs, everyDecisionHasEvidence } from "../assertions.js";

const transcript = `Leo: We finalized three things today.
Leo: One, we're moving the nightly batch job from 1am to 3am to avoid contention with backups.
Leo: Two, we're switching the staging database to the new connection pool size of 50.
Leo: Three, we're deprecating the old /v1/reports endpoint starting next quarter.
Leo: No action items today, just decisions to record.`;

export const normalMultipleDecisions: MeetingActionFixture = {
  name: "normal-multiple-decisions",
  input: { transcript, metadata: { date: "2026-08-24", title: "Architecture review" } },
  assertions: [
    statusIs("complete"),
    everyDecisionHasEvidence(),
    (result) => ({
      pass: (result.output?.decisions.length ?? 0) >= 3,
      message: `expected at least 3 decisions, got ${result.output?.decisions.length ?? 0}`,
    }),
    (result) => ({
      pass: (result.output?.action_items.length ?? 0) === 0,
      message: `expected no action items, got ${result.output?.action_items.length ?? 0}`,
    }),
    (result) => {
      const mentionsBatchJob = result.output?.decisions.some((d) =>
        d.text.toLowerCase().includes("batch job") || d.text.toLowerCase().includes("nightly")
      );
      return {
        pass: !!mentionsBatchJob,
        message: `expected at least one decision about the nightly batch job timing change, got ${JSON.stringify(result.output?.decisions)}`,
      };
    },
  ],
};
