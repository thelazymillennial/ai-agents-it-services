import { describe, expect, it, vi } from "vitest";
import { runRequirementsGapAgent, RequirementsGapPipelineError } from "./pipeline.js";
import type { ClaudeClient } from "../../lib/ai/claudeClient.js";

function fakeClient(responses: unknown[]): ClaudeClient {
  let call = 0;
  return {
    callTool: vi.fn(async () => responses[Math.min(call++, responses.length - 1)]),
  };
}

const multiLineDoc = `The system shall allow a user to request a password reset.
Section 2: Reset links expire in 24 hours.
The user receives an email with a reset link.
Section 4: Reset links expire in 1 hour.
If the link is invalid, the system shall show an error.
SSO login is out of scope for this story.
The system should respond quickly to all requests.`;

const validResponse = {
  summary: "Password reset story with several gaps.",
  ambiguities: [
    {
      text: "It's unclear who can trigger a password reset besides the account owner.",
      impact: "Support agents may be blocked from helping locked-out users.",
      evidence: { sourceId: "doc-1", locator: "L1" },
    },
  ],
  missing_information: [],
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
  edge_cases: [],
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

describe("runRequirementsGapAgent", () => {
  it("returns a complete result for a valid document", async () => {
    const client = fakeClient([validResponse]);
    const result = await runRequirementsGapAgent({ text: multiLineDoc }, { client });
    expect(result.status).toBe("complete");
    expect(result.output?.contradictions).toHaveLength(1);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it("returns insufficient_evidence when the model flags it", async () => {
    const client = fakeClient([
      {
        ...validResponse,
        insufficient_evidence: true,
        insufficient_evidence_reason: "Garbled input",
        ambiguities: [],
        contradictions: [],
        undefined_terms: [],
        testability_issues: [],
      },
    ]);
    const result = await runRequirementsGapAgent({ text: "???" }, { client });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.output).toBeNull();
    expect(result.missingInformation).toContain("Garbled input");
  });

  it("retries once when the first response fails schema validation, then succeeds", async () => {
    const client = fakeClient([{ bad: "shape" }, validResponse]);
    const result = await runRequirementsGapAgent({ text: multiLineDoc }, { client });
    expect(result.status).toBe("complete");
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("throws RequirementsGapPipelineError when both attempts fail schema validation", async () => {
    const client = fakeClient([{ bad: "shape" }, { still: "bad" }]);
    await expect(
      runRequirementsGapAgent({ text: multiLineDoc }, { client })
    ).rejects.toThrow(RequirementsGapPipelineError);
  });

  it("retries and eventually throws when an evidence locator is out of range", async () => {
    const badLocatorResponse = {
      ...validResponse,
      contradictions: [
        {
          text: "Section 2 says links expire in 24 hours; section 4 says 1 hour.",
          evidence_a: { sourceId: "doc-1", locator: "L2" },
          evidence_b: { sourceId: "doc-1", locator: "L9999" },
        },
      ],
    };
    const client = fakeClient([badLocatorResponse, badLocatorResponse]);
    await expect(
      runRequirementsGapAgent({ text: multiLineDoc }, { client })
    ).rejects.toThrow(RequirementsGapPipelineError);
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("reads the document from a file path when filePath is given", async () => {
    const client = fakeClient([validResponse]);
    const { writeFileSync, unlinkSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const filePath = join(tmpdir(), "requirements-gap-pipeline-test.txt");
    writeFileSync(filePath, multiLineDoc, "utf-8");

    try {
      const result = await runRequirementsGapAgent({ filePath }, { client });
      expect(result.status).toBe("complete");
    } finally {
      unlinkSync(filePath);
    }
  });

  it("propagates a rejection if the Claude client call itself fails", async () => {
    const client: ClaudeClient = {
      callTool: vi.fn(async () => {
        throw new Error("network error");
      }),
    };
    await expect(
      runRequirementsGapAgent({ text: multiLineDoc }, { client })
    ).rejects.toThrow("network error");
  });

  it("retries and eventually throws when a contradiction cites identical evidence on both sides", async () => {
    const degenerateResponse = {
      ...validResponse,
      contradictions: [
        {
          text: "Not a real contradiction",
          evidence_a: { sourceId: "doc-1", locator: "L2" },
          evidence_b: { sourceId: "doc-1", locator: "L2" },
        },
      ],
    };
    const client = fakeClient([degenerateResponse, degenerateResponse]);
    await expect(
      runRequirementsGapAgent({ text: multiLineDoc }, { client })
    ).rejects.toThrow(RequirementsGapPipelineError);
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("retries and eventually throws when an evidence locator has the wrong format", async () => {
    const malformedLocatorResponse = {
      ...validResponse,
      undefined_terms: [
        { term: "SSO", evidence: { sourceId: "doc-1", locator: "line-6" } },
      ],
    };
    const client = fakeClient([malformedLocatorResponse, malformedLocatorResponse]);
    await expect(
      runRequirementsGapAgent({ text: multiLineDoc }, { client })
    ).rejects.toThrow(RequirementsGapPipelineError);
  });
});
