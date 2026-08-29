import { describe, expect, it } from "vitest";
import {
  requirementsGapToolResponseSchema,
  buildRequirementsGapTool,
  REQUIREMENTS_GAP_TOOL_NAME,
} from "./schema.js";

const validResponse = {
  summary: "Password reset story with several gaps.",
  ambiguities: [
    {
      text: "It's unclear who can trigger a password reset besides the account owner.",
      impact: "Support agents may be blocked from helping locked-out users.",
      evidence: { sourceId: "doc-1", locator: "L3" },
    },
  ],
  missing_information: [
    {
      text: "No error state is defined for an expired reset link.",
      impact: "Developers will guess the behavior, likely inconsistently.",
      evidence: { sourceId: "doc-1", locator: "L5" },
    },
  ],
  contradictions: [
    {
      text: "Section 2 says links expire in 24 hours; section 4 says 1 hour.",
      evidence_a: { sourceId: "doc-1", locator: "L2" },
      evidence_b: { sourceId: "doc-1", locator: "L4" },
    },
  ],
  undefined_terms: [
    { term: "SSO", evidence: { sourceId: "doc-1", locator: "L6" } },
  ],
  edge_cases: [
    {
      text: "What happens if the user requests two reset links in a row?",
      impact: "Could allow an old link to still work, or silently invalidate it.",
      evidence: { sourceId: "doc-1", locator: "L3" },
    },
  ],
  testability_issues: [
    {
      text: "'The system should respond quickly' has no measurable threshold.",
      impact: "QA cannot write a pass/fail test for this criterion.",
      evidence: { sourceId: "doc-1", locator: "L7" },
    },
  ],
  stakeholder_questions: [
    "Should support agents be able to trigger a reset on a user's behalf?",
  ],
  insufficient_evidence: false,
};

describe("requirementsGapToolResponseSchema", () => {
  it("accepts a well-formed response", () => {
    expect(requirementsGapToolResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("rejects a response missing ambiguities", () => {
    const { ambiguities, ...rest } = validResponse;
    expect(requirementsGapToolResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a gap whose evidence has an empty locator", () => {
    const broken = {
      ...validResponse,
      ambiguities: [
        {
          ...validResponse.ambiguities[0],
          evidence: { sourceId: "doc-1", locator: "" },
        },
      ],
    };
    expect(requirementsGapToolResponseSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a contradiction missing evidence_b", () => {
    const { evidence_b, ...brokenContradiction } = validResponse.contradictions[0];
    const broken = { ...validResponse, contradictions: [brokenContradiction] };
    expect(requirementsGapToolResponseSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a response with insufficient_evidence true but non-empty ambiguities", () => {
    const inconsistent = {
      ...validResponse,
      insufficient_evidence: true,
      insufficient_evidence_reason: "test",
    };
    expect(requirementsGapToolResponseSchema.safeParse(inconsistent).success).toBe(false);
  });

  it("rejects a response with insufficient_evidence true but non-empty stakeholder_questions", () => {
    const inconsistent = {
      ...validResponse,
      ambiguities: [],
      missing_information: [],
      contradictions: [],
      undefined_terms: [],
      edge_cases: [],
      testability_issues: [],
      insufficient_evidence: true,
      insufficient_evidence_reason: "test",
    };
    expect(requirementsGapToolResponseSchema.safeParse(inconsistent).success).toBe(false);
  });

  it("rejects a response missing insufficient_evidence", () => {
    const { insufficient_evidence, ...rest } = validResponse;
    expect(requirementsGapToolResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a contradiction whose evidence_a and evidence_b are identical", () => {
    const degenerate = {
      ...validResponse,
      contradictions: [
        {
          text: "Not a real contradiction",
          evidence_a: { sourceId: "doc-1", locator: "L2" },
          evidence_b: { sourceId: "doc-1", locator: "L2" },
        },
      ],
    };
    expect(requirementsGapToolResponseSchema.safeParse(degenerate).success).toBe(false);
  });

  it("accepts a contradiction citing the same locator with different quotes", () => {
    const sameLine = {
      ...validResponse,
      contradictions: [
        {
          text: "Two sub-claims on the same line conflict",
          evidence_a: { sourceId: "doc-1", locator: "L2", quote: "must be unique" },
          evidence_b: { sourceId: "doc-1", locator: "L2", quote: "may repeat" },
        },
      ],
    };
    expect(requirementsGapToolResponseSchema.safeParse(sameLine).success).toBe(true);
  });
});

describe("buildRequirementsGapTool", () => {
  it("names the tool emit_requirements_gap", () => {
    expect(buildRequirementsGapTool().name).toBe(REQUIREMENTS_GAP_TOOL_NAME);
  });

  it("includes ambiguities as a required property in the generated schema and strips $schema", () => {
    const tool = buildRequirementsGapTool();
    const schema = tool.input_schema as {
      required?: string[];
      properties?: Record<string, unknown>;
    };
    expect(tool.input_schema).not.toHaveProperty("$schema");
    expect(schema.required).toContain("ambiguities");
    expect(schema.properties).toHaveProperty("ambiguities");
  });
});
