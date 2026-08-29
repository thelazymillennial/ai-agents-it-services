import type { Fixture } from "../../../lib/evals/runFixtures.js";
import type { RequirementsGapInput } from "../pipeline.js";
import type { AgentResult } from "../../../lib/types.js";
import type { RequirementsGapOutput } from "../schema.js";

export type RequirementsGapFixture = Fixture<
  RequirementsGapInput,
  AgentResult<RequirementsGapOutput>
>;
