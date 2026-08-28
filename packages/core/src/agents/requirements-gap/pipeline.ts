import type { ClaudeClient } from "../../lib/ai/claudeClient.js";
import type { AgentResult } from "../../lib/types.js";
import { buildTextSourceDocument } from "../../lib/text/sourceDocument.js";
import { readTranscriptFile } from "../../lib/files/readTranscriptFile.js";
import {
  buildRequirementsGapSystemPrompt,
  buildRequirementsGapUserMessage,
} from "./prompt.js";
import {
  buildRequirementsGapTool,
  requirementsGapToolResponseSchema,
  type RequirementsGapOutput,
} from "./schema.js";

export type RequirementsGapInput = { text: string; filename?: string } | { filePath: string };

export class RequirementsGapPipelineError extends Error {}

const MODEL = "claude-sonnet-5";
const MAX_ATTEMPTS = 2;

const LOCATOR_PATTERN = /^L(\d+)$/;

function collectLocators(output: RequirementsGapOutput): string[] {
  return [
    ...output.ambiguities.map((g) => g.evidence.locator),
    ...output.missing_information.map((g) => g.evidence.locator),
    ...output.contradictions.flatMap((c) => [c.evidence_a.locator, c.evidence_b.locator]),
    ...output.undefined_terms.map((u) => u.evidence.locator),
    ...output.edge_cases.map((g) => g.evidence.locator),
    ...output.testability_issues.map((g) => g.evidence.locator),
  ];
}

function locatorsAreValid(output: RequirementsGapOutput, lineCount: number): boolean {
  return collectLocators(output).every((locator) => {
    const match = LOCATOR_PATTERN.exec(locator);
    if (!match) return false;
    const lineNumber = Number(match[1]);
    return lineNumber >= 1 && lineNumber <= lineCount;
  });
}

function resolveText(input: RequirementsGapInput): { text: string; filename: string } {
  if ("filePath" in input) {
    return { text: readTranscriptFile(input.filePath), filename: input.filePath };
  }
  return { text: input.text, filename: input.filename ?? "requirements-document" };
}

export async function runRequirementsGapAgent(
  input: RequirementsGapInput,
  deps: { client: ClaudeClient }
): Promise<AgentResult<RequirementsGapOutput>> {
  const { text, filename } = resolveText(input);
  const doc = buildTextSourceDocument(text, { filename, kind: "txt" });
  const lineCount = doc.text.split("\n").length;
  const system = buildRequirementsGapSystemPrompt();
  const userMessage = buildRequirementsGapUserMessage(doc);
  const tool = buildRequirementsGapTool();

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const rawOutput = await deps.client.callTool({
      system,
      userMessage,
      tool,
      model: MODEL,
    });

    const parsed = requirementsGapToolResponseSchema.safeParse(rawOutput);
    if (parsed.success) {
      const { insufficient_evidence, insufficient_evidence_reason, ...output } =
        parsed.data;

      if (insufficient_evidence) {
        return {
          status: "insufficient_evidence",
          output: null,
          evidence: [],
          assumptions: [],
          missingInformation: insufficient_evidence_reason
            ? [insufficient_evidence_reason]
            : ["Model reported insufficient evidence."],
        };
      }

      if (!locatorsAreValid(output, lineCount)) {
        lastError = new Error(
          `One or more evidence locators are invalid or out of range for a ${lineCount}-line document`
        );
        continue;
      }

      return {
        status: "complete",
        output,
        evidence: [
          ...output.ambiguities.map((g) => g.evidence),
          ...output.missing_information.map((g) => g.evidence),
          ...output.contradictions.flatMap((c) => [c.evidence_a, c.evidence_b]),
          ...output.undefined_terms.map((u) => u.evidence),
          ...output.edge_cases.map((g) => g.evidence),
          ...output.testability_issues.map((g) => g.evidence),
        ],
        assumptions: [],
        missingInformation: [],
      };
    }

    lastError = parsed.error;
  }

  throw new RequirementsGapPipelineError(
    `Claude's response did not match the expected schema after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
