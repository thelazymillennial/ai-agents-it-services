import type { RequirementsGapFixture } from "./types.js";
import {
  statusIs,
  everyContradictionHasTwoSidedEvidence,
} from "../assertions.js";

const text = `Feature: Bulk Order Discounts

Business Rule: Orders over 100 units receive a 10% discount, and this is the maximum discount available on any order.

Acceptance Criteria:
1. For orders over 500 units, apply a 20% discount.`;

export const contradictoryLimitVsBusinessRule: RequirementsGapFixture = {
  name: "contradictory-limit-vs-business-rule",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsCeilingConflict = result.output?.contradictions.some((c) => {
        const text = c.text.toLowerCase();
        return (text.includes("maximum") || text.includes("10%")) && text.includes("20%");
      });
      return {
        pass: !!mentionsCeilingConflict,
        message: `expected a contradiction about the 10% maximum-discount rule conflicting with the 20% acceptance criterion, got ${JSON.stringify(result.output?.contradictions)}`,
      };
    },
    everyContradictionHasTwoSidedEvidence(),
  ],
};
