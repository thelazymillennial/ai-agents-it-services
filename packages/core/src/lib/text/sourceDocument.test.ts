import { describe, expect, it } from "vitest";
import { buildTextSourceDocument } from "./sourceDocument.js";

describe("buildTextSourceDocument", () => {
  it("prefixes each line with a line number", () => {
    const doc = buildTextSourceDocument("Alice: hi\nBob: hey", { filename: "call.txt" });
    expect(doc.text).toBe("L1: Alice: hi\nL2: Bob: hey");
  });

  it("sets kind and filename from options", () => {
    const doc = buildTextSourceDocument("hello", { filename: "call.txt", kind: "transcript" });
    expect(doc.kind).toBe("transcript");
    expect(doc.filename).toBe("call.txt");
  });

  it("defaults filename to 'document' and kind to 'txt' when options are omitted", () => {
    const doc = buildTextSourceDocument("hello");
    expect(doc.filename).toBe("document");
    expect(doc.kind).toBe("txt");
  });
});
