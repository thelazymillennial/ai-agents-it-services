import type { Fixture } from "../../../lib/evals/runFixtures.js";
import type { MeetingActionInput } from "../pipeline.js";
import type { AgentResult } from "../../../lib/types.js";
import type { MeetingActionOutput } from "../schema.js";

export type MeetingActionFixture = Fixture<
  MeetingActionInput,
  AgentResult<MeetingActionOutput>
>;
