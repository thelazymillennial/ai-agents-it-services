import type { RequirementsGapFixture } from "./types.js";
import {
  statusIs,
  everyContradictionHasTwoSidedEvidence,
} from "../assertions.js";

const text = `Feature: Discount Codes

Acceptance Criteria:
1. A discount code can only be applied once per customer account.
2. A customer can apply the same discount code multiple times across different orders as long as each order totals over $50.`;

export const contradictoryConflictingAcceptanceCriteria: RequirementsGapFixture = {
  name: "contradictory-conflicting-acceptance-criteria",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsScopeConflict = result.output?.contradictions.some((c) => {
        const text = c.text.toLowerCase();
        return text.includes("once") && (text.includes("multiple") || text.includes("order"));
      });
      return {
        pass: !!mentionsScopeConflict,
        message: `expected a contradiction about the once-per-account vs. multiple-times-per-order scope conflict, got ${JSON.stringify(result.output?.contradictions)}`,
      };
    },
    everyContradictionHasTwoSidedEvidence(),
  ],
};
