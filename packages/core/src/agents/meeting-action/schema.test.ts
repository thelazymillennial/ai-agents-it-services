import { describe, expect, it } from "vitest";
import {
  meetingActionToolResponseSchema,
  buildMeetingActionTool,
  MEETING_ACTION_TOOL_NAME,
} from "./schema.js";

const validResponse = {
  summary: "Weekly sync",
  decisions: [
    { text: "Ship Friday", evidence: { sourceId: "transcript-1", locator: "L2" } },
  ],
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

describe("meetingActionToolResponseSchema", () => {
  it("accepts a well-formed response", () => {
    expect(meetingActionToolResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("rejects a response missing action_items", () => {
    const { action_items, ...rest } = validResponse;
    expect(meetingActionToolResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an action item whose evidence has no locator", () => {
    const broken = {
      ...validResponse,
      action_items: [
        {
          ...validResponse.action_items[0],
          evidence: { sourceId: "transcript-1" },
        },
      ],
    };
    expect(meetingActionToolResponseSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects an action item whose evidence has an empty locator", () => {
    const broken = {
      ...validResponse,
      action_items: [
        {
          ...validResponse.action_items[0],
          evidence: { sourceId: "transcript-1", locator: "" },
        },
      ],
    };
    expect(meetingActionToolResponseSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a response missing insufficient_evidence", () => {
    const { insufficient_evidence, ...rest } = validResponse;
    expect(meetingActionToolResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a response with insufficient_evidence true but non-empty action_items", () => {
    const inconsistent = {
      ...validResponse,
      insufficient_evidence: true,
      insufficient_evidence_reason: "test",
    };
    // validResponse already has one action_item and one decision — leave them populated
    expect(meetingActionToolResponseSchema.safeParse(inconsistent).success).toBe(false);
  });
});

describe("buildMeetingActionTool", () => {
  it("names the tool emit_meeting_action", () => {
    expect(buildMeetingActionTool().name).toBe(MEETING_ACTION_TOOL_NAME);
  });

  it("includes action_items as a required property in the generated schema and strips $schema", () => {
    const tool = buildMeetingActionTool();
    const schema = tool.input_schema as {
      required?: string[];
      properties?: Record<string, unknown>;
    };
    expect(tool.input_schema).not.toHaveProperty("$schema");
    expect(schema.required).toContain("action_items");
    expect(schema.properties).toHaveProperty("action_items");
  });
});
