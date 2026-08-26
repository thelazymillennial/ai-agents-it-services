import type { SourceDocument } from "../types.js";

export function buildTranscriptSourceDocument(
  rawTranscript: string,
  filename = "transcript"
): SourceDocument {
  const numbered = rawTranscript
    .split(/\r?\n/)
    .map((line, index) => `L${index + 1}: ${line}`)
    .join("\n");

  return {
    id: "transcript-1",
    filename,
    kind: "transcript",
    text: numbered,
  };
}
