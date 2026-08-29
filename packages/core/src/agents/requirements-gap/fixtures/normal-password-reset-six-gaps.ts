import type { RequirementsGapFixture } from "./types.js";
import {
  statusIs,
  undefinedTermFound,
  contradictionMentions,
  everyGapHasEvidence,
  everyContradictionHasTwoSidedEvidence,
} from "../assertions.js";

const text = `User Story: Password Reset

As a user, I want to reset my password so that I can regain access to my account.

Acceptance Criteria:
1. The user requests a password reset from the login page.
2. The system sends a reset link to the user's registered email.
3. The reset link expires after 24 hours.
4. If the user does not complete SSO verification, the reset link is invalid after 1 hour.
5. The user sets a new password and is logged in automatically.
6. The system should respond quickly to all reset requests.`;

export const normalPasswordResetSixGaps: RequirementsGapFixture = {
  name: "normal-password-reset-six-gaps",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsTrigger = result.output?.ambiguities.some((a) =>
        a.text.toLowerCase().includes("trigger") ||
        a.text.toLowerCase().includes("who") ||
        a.text.toLowerCase().includes("account owner")
      );
      return {
        pass: !!mentionsTrigger,
        message: `expected an ambiguity about who besides the account owner can trigger a reset, got ${JSON.stringify(result.output?.ambiguities)}`,
      };
    },
    undefinedTermFound("SSO"),
    contradictionMentions("hour"),
    everyGapHasEvidence(),
    everyContradictionHasTwoSidedEvidence(),
    (result) => {
      const hasTestabilityIssue = result.output?.testability_issues.some(
        (t) =>
          t.text.toLowerCase().includes("quickly") ||
          t.text.toLowerCase().includes("respond")
      );
      return {
        pass: !!hasTestabilityIssue,
        message: `expected a testability issue about "respond quickly" having no measurable threshold, got ${JSON.stringify(
          result.output?.testability_issues
        )}`,
      };
    },
    (result) => ({
      pass: (result.output?.missing_information.length ?? 0) >= 1,
      message: `expected at least one missing_information item (e.g. no defined error state for an invalid/expired link), got ${
        result.output?.missing_information.length ?? 0
      }`,
    }),
  ],
};
