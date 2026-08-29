import type { ClaudeClient } from "../../lib/ai/claudeClient.js";
import type { AgentResult } from "../../lib/types.js";
import { buildTextSourceDocument } from "../../lib/text/sourceDocument.js";
import { readTranscriptFile } from "../../lib/files/readTranscriptFile.js";
import {
  buildMeetingActionSystemPrompt,
  buildMeetingActionUserMessage,
  type MeetingMetadata,
} from "./prompt.js";
import {
  buildMeetingActionTool,
  meetingActionToolResponseSchema,
  type MeetingActionOutput,
} from "./schema.js";

export type MeetingActionInput =
  | { transcript: string; filename?: string; metadata?: MeetingMetadata }
  | { filePath: string; metadata?: MeetingMetadata };

export class MeetingActionPipelineError extends Error {}

const MODEL = "claude-sonnet-5";
const MAX_ATTEMPTS = 2;

const LOCATOR_PATTERN = /^L(\d+)$/;

function locatorsAreValid(
  output: {
    decisions: { evidence: { locator: string } }[];
    action_items: { evidence: { locator: string } }[];
  },
  transcriptLineCount: number
): boolean {
  const allLocators = [
    ...output.decisions.map((d) => d.evidence.locator),
    ...output.action_items.map((a) => a.evidence.locator),
  ];

  return allLocators.every((locator) => {
    const match = LOCATOR_PATTERN.exec(locator);
    if (!match) return false;
    const lineNumber = Number(match[1]);
    return lineNumber >= 1 && lineNumber <= transcriptLineCount;
  });
}

function resolveTranscript(input: MeetingActionInput): {
  transcript: string;
  filename: string;
} {
  if ("filePath" in input) {
    return {
      transcript: readTranscriptFile(input.filePath),
      filename: input.filePath,
    };
  }
  return {
    transcript: input.transcript,
    filename: input.filename ?? "transcript",
  };
}

export async function runMeetingActionAgent(
  input: MeetingActionInput,
  deps: { client: ClaudeClient }
): Promise<AgentResult<MeetingActionOutput>> {
  const { transcript, filename } = resolveTranscript(input);
  const doc = buildTextSourceDocument(transcript, { filename, kind: "transcript" });
  const transcriptLineCount = doc.text.split("\n").length;
  const system = buildMeetingActionSystemPrompt();
  const userMessage = buildMeetingActionUserMessage(doc, input.metadata);
  const tool = buildMeetingActionTool();

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const rawOutput = await deps.client.callTool({
      system,
      userMessage,
      tool,
      model: MODEL,
    });

    const parsed = meetingActionToolResponseSchema.safeParse(rawOutput);
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

      if (!locatorsAreValid(output, transcriptLineCount)) {
        lastError = new Error(
          `One or more evidence locators are invalid or out of range for a ${transcriptLineCount}-line transcript`
        );
        continue;
      }

      return {
        status: "complete",
        output,
        evidence: [
          ...output.decisions.map((d) => d.evidence),
          ...output.action_items.map((a) => a.evidence),
        ],
        assumptions: [],
        missingInformation: [],
      };
    }

    lastError = parsed.error;
  }

  throw new MeetingActionPipelineError(
    `Claude's response did not match the expected schema after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
