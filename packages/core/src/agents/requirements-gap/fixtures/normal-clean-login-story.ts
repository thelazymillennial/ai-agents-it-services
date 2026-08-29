import type { RequirementsGapFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const text = `User Story: User Login

As a registered user, I want to log in with my email and password so that I can access my account.

Acceptance Criteria:
1. Given a registered user with a verified email, when they submit correct email and password on the login form, then they are redirected to their dashboard within 2 seconds.
2. Given a registered user, when they submit an incorrect password three times in a row, then their account is locked for 15 minutes and they see a message stating the lockout duration.
3. Given an unregistered email, when a user attempts to log in, then the system displays "Invalid email or password" without indicating whether the email exists.
4. Given a locked account, when the user attempts to log in with correct credentials, then the system displays the remaining lockout time.`;

export const normalCleanLoginStory: RequirementsGapFixture = {
  name: "normal-clean-login-story",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => ({
      pass: (result.output?.testability_issues.length ?? 0) <= 1,
      message: `expected at most 1 testability issue for a well-specified story with concrete numbers, got ${JSON.stringify(
        result.output?.testability_issues
      )}`,
    }),
    (result) => ({
      pass: (result.output?.contradictions.length ?? 0) === 0,
      message: `expected no contradictions in an internally consistent story, got ${JSON.stringify(
        result.output?.contradictions
      )}`,
    }),
    (result) => ({
      pass: (result.output?.ambiguities.length ?? 0) <= 2,
      message: `expected at most 2 ambiguities for a well-specified story with concrete numbers, got ${JSON.stringify(result.output?.ambiguities)}`,
    }),
    (result) => ({
      pass: (result.output?.missing_information.length ?? 0) <= 2,
      message: `expected at most 2 missing_information items for a well-specified story, got ${JSON.stringify(result.output?.missing_information)}`,
    }),
  ],
};
