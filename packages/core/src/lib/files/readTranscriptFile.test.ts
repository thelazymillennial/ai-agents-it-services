import { afterEach, describe, expect, it } from "vitest";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readTranscriptFile } from "./readTranscriptFile.js";

describe("readTranscriptFile", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    while (tempFiles.length) {
      unlinkSync(tempFiles.pop() as string);
    }
  });

  function writeTempFile(name: string, content: string): string {
    const filePath = join(tmpdir(), name);
    writeFileSync(filePath, content, "utf-8");
    tempFiles.push(filePath);
    return filePath;
  }

  it("reads a .txt file", () => {
    const filePath = writeTempFile("meeting-action-test.txt", "Alice: hi");
    expect(readTranscriptFile(filePath)).toBe("Alice: hi");
  });

  it("reads a .md file", () => {
    const filePath = writeTempFile("meeting-action-test.md", "# Notes\nAlice: hi");
    expect(readTranscriptFile(filePath)).toBe("# Notes\nAlice: hi");
  });

  it("throws on an unsupported extension", () => {
    const filePath = writeTempFile("meeting-action-test.pdf", "binary-ish");
    expect(() => readTranscriptFile(filePath)).toThrow(/Unsupported transcript file type/);
  });
});
