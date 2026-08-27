import { describe, expect, it, vi } from "vitest";
import { runMeetingActionAgent, MeetingActionPipelineError } from "./pipeline.js";
import type { ClaudeClient } from "../../lib/ai/claudeClient.js";

function fakeClient(responses: unknown[]): ClaudeClient {
  let call = 0;
  return {
    callTool: vi.fn(async () => responses[Math.min(call++, responses.length - 1)]),
  };
}

const multiLineTranscript = [
  "Alice: let's ship Friday",
  "Bob: sounds good",
  "Alice: Priya, can you update the deploy script?",
  "Priya: sure, I'll do it",
].join("\n");

const validResponse = {
  summary: "Weekly sync",
  decisions: [{ text: "Ship Friday", evidence: { sourceId: "transcript-1", locator: "L2" } }],
  action_items: [
    {
      action: "Update the deploy script",
      owner: "Priya",
      due_date: "Unknown",
      evidence: { sourceId: "transcript-1", locator: "L4" },
      status: "open",
    },
  ],
  blockers: [],
  open_questions: [],
  follow_ups: [],
  insufficient_evidence: false,
};

describe("runMeetingActionAgent", () => {
  it("returns a complete result for a valid transcript", async () => {
    const client = fakeClient([validResponse]);
    const result = await runMeetingActionAgent(
      { transcript: multiLineTranscript },
      { client }
    );
    expect(result.status).toBe("complete");
    expect(result.output?.action_items[0].owner).toBe("Priya");
    expect(result.evidence).toHaveLength(2);
  });

  it("returns insufficient_evidence when the model flags it", async () => {
    const client = fakeClient([
      {
        ...validResponse,
        insufficient_evidence: true,
        insufficient_evidence_reason: "Garbled input",
        decisions: [],
        action_items: [],
      },
    ]);
    const result = await runMeetingActionAgent({ transcript: "???" }, { client });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.output).toBeNull();
    expect(result.missingInformation).toContain("Garbled input");
  });

  it("retries once when the first response fails schema validation, then succeeds", async () => {
    const client = fakeClient([{ bad: "shape" }, validResponse]);
    const result = await runMeetingActionAgent(
      { transcript: multiLineTranscript },
      { client }
    );
    expect(result.status).toBe("complete");
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("throws MeetingActionPipelineError when both attempts fail schema validation", async () => {
    const client = fakeClient([{ bad: "shape" }, { still: "bad" }]);
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow(MeetingActionPipelineError);
  });

  it("retries and eventually throws when the response is self-inconsistent (insufficient_evidence true but data present)", async () => {
    const inconsistentResponse = {
      ...validResponse,
      insufficient_evidence: true,
      insufficient_evidence_reason: "flagged but also returned data",
    };
    const client = fakeClient([inconsistentResponse, inconsistentResponse]);
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow(MeetingActionPipelineError);
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("includes the validation failure reason in the thrown error message", async () => {
    const client = fakeClient([{ bad: "shape" }, { still: "bad" }]);
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow(/did not match the expected schema/);
  });

  it("propagates a rejection if the Claude client call itself fails", async () => {
    const client: ClaudeClient = {
      callTool: vi.fn(async () => {
        throw new Error("network error");
      }),
    };
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow("network error");
  });

  it("reads the transcript from a file path when filePath is given", async () => {
    const client = fakeClient([validResponse]);
    const { writeFileSync, unlinkSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const filePath = join(tmpdir(), "meeting-action-pipeline-test.txt");
    writeFileSync(filePath, multiLineTranscript, "utf-8");

    try {
      const result = await runMeetingActionAgent({ filePath }, { client });
      expect(result.status).toBe("complete");
    } finally {
      unlinkSync(filePath);
    }
  });

  it("retries and eventually throws when an evidence locator is out of range for the transcript", async () => {
    const badLocatorResponse = {
      ...validResponse,
      decisions: [
        { text: "Ship Friday", evidence: { sourceId: "transcript-1", locator: "L9999" } },
      ],
    };
    const client = fakeClient([badLocatorResponse, badLocatorResponse]);
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow(MeetingActionPipelineError);
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });

  it("retries and eventually throws when an evidence locator has the wrong format", async () => {
    const malformedLocatorResponse = {
      ...validResponse,
      action_items: [
        {
          action: "Update the deploy script",
          owner: "Priya",
          due_date: "Unknown",
          evidence: { sourceId: "transcript-1", locator: "line-4" },
          status: "open",
        },
      ],
    };
    const client = fakeClient([malformedLocatorResponse, malformedLocatorResponse]);
    await expect(
      runMeetingActionAgent({ transcript: "Alice: let's ship Friday" }, { client })
    ).rejects.toThrow(MeetingActionPipelineError);
  });

  it("succeeds when the retry produces valid locators after an initial out-of-range locator", async () => {
    const badLocatorResponse = {
      ...validResponse,
      decisions: [
        { text: "Ship Friday", evidence: { sourceId: "transcript-1", locator: "L9999" } },
      ],
    };
    const client = fakeClient([badLocatorResponse, validResponse]);
    const result = await runMeetingActionAgent(
      { transcript: multiLineTranscript },
      { client }
    );
    expect(result.status).toBe("complete");
    expect(client.callTool).toHaveBeenCalledTimes(2);
  });
});
