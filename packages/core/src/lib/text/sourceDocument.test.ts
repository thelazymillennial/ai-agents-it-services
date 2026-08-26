import { describe, expect, it } from "vitest";
import { buildTranscriptSourceDocument } from "./sourceDocument.js";

describe("buildTranscriptSourceDocument", () => {
  it("prefixes each line with a line number", () => {
    const doc = buildTranscriptSourceDocument("Alice: hi\nBob: hey", "call.txt");
    expect(doc.text).toBe("L1: Alice: hi\nL2: Bob: hey");
  });

  it("sets kind to transcript and keeps the filename", () => {
    const doc = buildTranscriptSourceDocument("hello", "call.txt");
    expect(doc.kind).toBe("transcript");
    expect(doc.filename).toBe("call.txt");
  });

  it("defaults the filename when none is given", () => {
    const doc = buildTranscriptSourceDocument("hello");
    expect(doc.filename).toBe("transcript");
  });
});
