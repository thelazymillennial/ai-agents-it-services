import { z } from "zod";
import type { ToolDefinition } from "../../lib/ai/claudeClient.js";

const evidenceSchema = z.object({
  sourceId: z.string(),
  quote: z.string().optional(),
  locator: z.string().min(1),
});

const gapSchema = z.object({
  text: z.string(),
  impact: z.string(),
  evidence: evidenceSchema,
});

const contradictionSchema = z.object({
  text: z.string(),
  evidence_a: evidenceSchema,
  evidence_b: evidenceSchema,
});

const undefinedTermSchema = z.object({
  term: z.string(),
  evidence: evidenceSchema,
});

export const requirementsGapOutputSchema = z.object({
  summary: z.string(),
  ambiguities: z.array(gapSchema),
  missing_information: z.array(gapSchema),
  contradictions: z.array(contradictionSchema),
  undefined_terms: z.array(undefinedTermSchema),
  edge_cases: z.array(gapSchema),
  testability_issues: z.array(gapSchema),
  stakeholder_questions: z.array(z.string()),
});

export type RequirementsGapOutput = z.infer<typeof requirementsGapOutputSchema>;

// insufficient_evidence fields exist only so the model can report a dead-end
// through the single forced tool call; pipeline.ts strips them before
// constructing the public RequirementsGapOutput.
export const requirementsGapToolResponseSchema = requirementsGapOutputSchema
  .extend({
    insufficient_evidence: z.boolean(),
    insufficient_evidence_reason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.insufficient_evidence &&
      (data.ambiguities.length > 0 ||
        data.missing_information.length > 0 ||
        data.contradictions.length > 0 ||
        data.undefined_terms.length > 0 ||
        data.edge_cases.length > 0 ||
        data.testability_issues.length > 0 ||
        data.stakeholder_questions.length > 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "insufficient_evidence is true but one or more gap arrays are not empty",
      });
    }

    data.contradictions.forEach((contradiction, index) => {
      const isIdentical =
        contradiction.evidence_a.sourceId === contradiction.evidence_b.sourceId &&
        contradiction.evidence_a.locator === contradiction.evidence_b.locator &&
        contradiction.evidence_a.quote === contradiction.evidence_b.quote;

      if (isIdentical) {
        ctx.addIssue({
          code: "custom",
          message:
            "a contradiction's evidence_a and evidence_b cite identical evidence (same sourceId, locator, and quote) -- a contradiction needs two genuinely distinct pieces of evidence",
          path: ["contradictions", index],
        });
      }
    });
  });

export type RequirementsGapToolResponse = z.infer<
  typeof requirementsGapToolResponseSchema
>;

export const REQUIREMENTS_GAP_TOOL_NAME = "emit_requirements_gap";

export function buildRequirementsGapTool(): ToolDefinition {
  const schema = z.toJSONSchema(requirementsGapToolResponseSchema) as Record<
    string,
    unknown
  >;
  const { $schema, ...inputSchema } = schema;

  return {
    name: REQUIREMENTS_GAP_TOOL_NAME,
    description:
      "Emit the structured requirements-gap analysis, including ambiguities, missing information, contradictions, undefined terms, edge cases, testability issues and an insufficient-evidence flag.",
    input_schema: inputSchema,
  };
}
