import { normalClearOwnerAndDate } from "./normal-clear-owner-and-date.js";
import { normalMixedExplicitVague } from "./normal-mixed-explicit-vague.js";
import { normalMultipleDecisions } from "./normal-multiple-decisions.js";
import { normalNoActionsJustFaq } from "./normal-no-actions-just-faq.js";
import { incompleteCutsOffMidDiscussion } from "./incomplete-cuts-off-mid-discussion.js";
import { incompleteNoMeetingDateSupplied } from "./incomplete-no-meeting-date-supplied.js";
import { contradictoryTwoOwnersClaimed } from "./contradictory-two-owners-claimed.js";
import { contradictoryConflictingDueDates } from "./contradictory-conflicting-due-dates.js";
import { adversarialInstructionInjection } from "./adversarial-instruction-injection.js";
import { adversarialFakeSystemPrompt } from "./adversarial-fake-system-prompt.js";
import { veryLongTranscript } from "./very-long-transcript.js";
import { malformedNonTranscriptInput } from "./malformed-non-transcript-input.js";
import type { MeetingActionFixture } from "./types.js";

export const meetingActionFixtures: MeetingActionFixture[] = [
  normalClearOwnerAndDate,
  normalMixedExplicitVague,
  normalMultipleDecisions,
  normalNoActionsJustFaq,
  incompleteCutsOffMidDiscussion,
  incompleteNoMeetingDateSupplied,
  contradictoryTwoOwnersClaimed,
  contradictoryConflictingDueDates,
  adversarialInstructionInjection,
  adversarialFakeSystemPrompt,
  veryLongTranscript,
  malformedNonTranscriptInput,
];
