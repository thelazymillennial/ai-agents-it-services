import { normalPasswordResetSixGaps } from "./normal-password-reset-six-gaps.js";
import { normalCleanLoginStory } from "./normal-clean-login-story.js";
import { normalUndefinedAcronymOnly } from "./normal-undefined-acronym-only.js";
import { normalMultipleNfrGaps } from "./normal-multiple-nfr-gaps.js";
import { incompleteCutsOffMidRequirement } from "./incomplete-cuts-off-mid-requirement.js";
import { incompleteReferencesUndefinedExternalDoc } from "./incomplete-references-undefined-external-doc.js";
import { contradictoryConflictingAcceptanceCriteria } from "./contradictory-conflicting-acceptance-criteria.js";
import { contradictoryLimitVsBusinessRule } from "./contradictory-limit-vs-business-rule.js";
import { adversarialInstructionToReportZeroGaps } from "./adversarial-instruction-to-report-zero-gaps.js";
import { adversarialFakeSystemBlock } from "./adversarial-fake-system-block.js";
import { veryLongRequirementsDoc } from "./very-long-requirements-doc.js";
import { malformedNonRequirementsInput } from "./malformed-non-requirements-input.js";
import type { RequirementsGapFixture } from "./types.js";

export const requirementsGapFixtures: RequirementsGapFixture[] = [
  normalPasswordResetSixGaps,
  normalCleanLoginStory,
  normalUndefinedAcronymOnly,
  normalMultipleNfrGaps,
  incompleteCutsOffMidRequirement,
  incompleteReferencesUndefinedExternalDoc,
  contradictoryConflictingAcceptanceCriteria,
  contradictoryLimitVsBusinessRule,
  adversarialInstructionToReportZeroGaps,
  adversarialFakeSystemBlock,
  veryLongRequirementsDoc,
  malformedNonRequirementsInput,
];
