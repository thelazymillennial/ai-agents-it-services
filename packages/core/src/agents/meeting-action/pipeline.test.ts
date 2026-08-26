import { describe, expect, it, vi } from "vitest";
import { runMeetingActionAgent, MeetingActionPipelineError } from "./pipeline.js";
import type { ClaudeClient } from "../../lib/ai/claudeClient.js";

function fakeClient(responses: unknown[]): ClaudeClient {
  let call = 0;
  return {
    callTool: vi.fn(async () => responses[Math.min(call++, responses.length - 1)]),
  };
}

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
      { transcript: "Alice: let's ship Friday" },
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
      { transcript: "Alice: let's ship Friday" },
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

  it("reads the transcript from a file path when filePath is given", async () => {
    const client = fakeClient([validResponse]);
    const { writeFileSync, unlinkSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const filePath = join(tmpdir(), "meeting-action-pipeline-test.txt");
    writeFileSync(filePath, "Alice: let's ship Friday", "utf-8");

    try {
      const result = await runMeetingActionAgent({ filePath }, { client });
      expect(result.status).toBe("complete");
    } finally {
      unlinkSync(filePath);
    }
  });
});
