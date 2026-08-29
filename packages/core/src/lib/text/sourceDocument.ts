import type { SourceDocument } from "../types.js";

export type BuildTextSourceDocumentOptions = {
  filename?: string;
  kind?: SourceDocument["kind"];
};

export function buildTextSourceDocument(
  rawText: string,
  options: BuildTextSourceDocumentOptions = {}
): SourceDocument {
  const numbered = rawText
    .split(/\r?\n/)
    .map((line, index) => `L${index + 1}: ${line}`)
    .join("\n");

  return {
    id: "doc-1",
    filename: options.filename ?? "document",
    kind: options.kind ?? "txt",
    text: numbered,
  };
}
