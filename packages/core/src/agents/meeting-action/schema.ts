import { z } from "zod";
import type { ToolDefinition } from "../../lib/ai/claudeClient.js";

const evidenceSchema = z.object({
  sourceId: z.string(),
  quote: z.string().optional(),
  locator: z.string().min(1),
});

export const meetingActionOutputSchema = z.object({
  summary: z.string(),
  decisions: z.array(
    z.object({
      text: z.string(),
      evidence: evidenceSchema,
    })
  ),
  action_items: z.array(
    z.object({
      action: z.string(),
      owner: z.string(),
      due_date: z.string(),
      evidence: evidenceSchema,
      status: z.string(),
    })
  ),
  blockers: z.array(z.string()),
  open_questions: z.array(z.string()),
  follow_ups: z.array(z.string()),
});

export type MeetingActionOutput = z.infer<typeof meetingActionOutputSchema>;

// insufficient_evidence fields exist only so the model can report a dead-end
// through the single forced tool call; pipeline.ts strips them before
// constructing the public MeetingActionOutput.
export const meetingActionToolResponseSchema = meetingActionOutputSchema.extend({
  insufficient_evidence: z.boolean(),
  insufficient_evidence_reason: z.string().optional(),
});

export type MeetingActionToolResponse = z.infer<
  typeof meetingActionToolResponseSchema
>;

export const MEETING_ACTION_TOOL_NAME = "emit_meeting_action";

export function buildMeetingActionTool(): ToolDefinition {
  const schema = z.toJSONSchema(meetingActionToolResponseSchema) as Record<
    string,
    unknown
  >;
  const { $schema, ...inputSchema } = schema;

  return {
    name: MEETING_ACTION_TOOL_NAME,
    description:
      "Emit the structured meeting-action extraction result, including decisions, action items and an insufficient-evidence flag.",
    input_schema: inputSchema,
  };
}
