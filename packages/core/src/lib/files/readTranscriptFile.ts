import { readFileSync } from "node:fs";
import { extname } from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md"]);

export function readTranscriptFile(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported transcript file type "${ext}". Supported types: .txt, .md`
    );
  }
  return readFileSync(filePath, "utf-8");
}
