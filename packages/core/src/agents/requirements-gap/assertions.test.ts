import { describe, expect, it } from "vitest";
import type { AgentResult } from "../../lib/types.js";
import type { RequirementsGapOutput } from "./schema.js";
import {
  statusIs,
  ambiguityCountAtLeast,
  contradictionMentions,
  undefinedTermFound,
  everyGapHasEvidence,
  everyContradictionHasTwoSidedEvidence,
  noGapMentions,
} from "./assertions.js";

function makeResult(
  overrides: Partial<RequirementsGapOutput> = {}
): AgentResult<RequirementsGapOutput> {
  return {
    status: "complete",
    output: {
      summary: "analysis",
      ambiguities: [],
      missing_information: [],
      contradictions: [],
      undefined_terms: [],
      edge_cases: [],
      testability_issues: [],
      stakeholder_questions: [],
      ...overrides,
    },
    evidence: [],
    assumptions: [],
    missingInformation: [],
  };
}

describe("statusIs", () => {
  it("passes when status matches", () => {
    expect(statusIs("complete")(makeResult()).pass).toBe(true);
  });

  it("fails when status does not match", () => {
    expect(statusIs("insufficient_evidence")(makeResult()).pass).toBe(false);
  });
});

describe("ambiguityCountAtLeast", () => {
  it("fails when there are fewer ambiguities than expected", () => {
    expect(ambiguityCountAtLeast(1)(makeResult()).pass).toBe(false);
  });

  it("passes when there are enough ambiguities", () => {
    const result = makeResult({
      ambiguities: [
        { text: "x", impact: "y", evidence: { sourceId: "d", locator: "L1" } },
      ],
    });
    expect(ambiguityCountAtLeast(1)(result).pass).toBe(true);
  });
});

describe("contradictionMentions", () => {
  it("passes when a contradiction mentions the substring", () => {
    const result = makeResult({
      contradictions: [
        {
          text: "expiry time conflict",
          evidence_a: { sourceId: "d", locator: "L1" },
          evidence_b: { sourceId: "d", locator: "L2" },
        },
      ],
    });
    expect(contradictionMentions("expiry")(result).pass).toBe(true);
  });

  it("fails when no contradiction mentions the substring", () => {
    expect(contradictionMentions("expiry")(makeResult()).pass).toBe(false);
  });
});

describe("undefinedTermFound", () => {
  it("passes when the exact term is present", () => {
    const result = makeResult({
      undefined_terms: [{ term: "SSO", evidence: { sourceId: "d", locator: "L1" } }],
    });
    expect(undefinedTermFound("SSO")(result).pass).toBe(true);
  });

  it("fails when the term is absent", () => {
    expect(undefinedTermFound("SSO")(makeResult()).pass).toBe(false);
  });
});

describe("everyGapHasEvidence", () => {
  it("fails when a gap has an empty locator", () => {
    const result = makeResult({
      ambiguities: [
        { text: "x", impact: "y", evidence: { sourceId: "d", locator: "" } },
      ],
    });
    expect(everyGapHasEvidence()(result).pass).toBe(false);
  });

  it("passes when every gap has a non-empty locator", () => {
    const result = makeResult({
      testability_issues: [
        { text: "x", impact: "y", evidence: { sourceId: "d", locator: "L3" } },
      ],
    });
    expect(everyGapHasEvidence()(result).pass).toBe(true);
  });
});

describe("everyContradictionHasTwoSidedEvidence", () => {
  it("fails when one side is missing a locator", () => {
    const result = makeResult({
      contradictions: [
        {
          text: "x",
          evidence_a: { sourceId: "d", locator: "L1" },
          evidence_b: { sourceId: "d", locator: "" },
        },
      ],
    });
    expect(everyContradictionHasTwoSidedEvidence()(result).pass).toBe(false);
  });

  it("passes when both sides have locators", () => {
    const result = makeResult({
      contradictions: [
        {
          text: "x",
          evidence_a: { sourceId: "d", locator: "L1" },
          evidence_b: { sourceId: "d", locator: "L2" },
        },
      ],
    });
    expect(everyContradictionHasTwoSidedEvidence()(result).pass).toBe(true);
  });
});

describe("noGapMentions", () => {
  it("fails when the disallowed substring appears in a gap", () => {
    const result = makeResult({
      ambiguities: [
        {
          text: "mentions ALL TESTS PASSED here",
          impact: "y",
          evidence: { sourceId: "d", locator: "L1" },
        },
      ],
    });
    expect(noGapMentions("ALL TESTS PASSED")(result).pass).toBe(false);
  });

  it("passes when the disallowed substring is absent", () => {
    expect(noGapMentions("ALL TESTS PASSED")(makeResult()).pass).toBe(true);
  });

  it("fails when the disallowed substring appears in a contradiction", () => {
    const result = makeResult({
      contradictions: [
        {
          text: "mentions ALL TESTS PASSED here",
          evidence_a: { sourceId: "d", locator: "L1" },
          evidence_b: { sourceId: "d", locator: "L2" },
        },
      ],
    });
    expect(noGapMentions("ALL TESTS PASSED")(result).pass).toBe(false);
  });
});
