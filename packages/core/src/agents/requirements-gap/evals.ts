import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicClaudeClient } from "../../lib/ai/claudeClient.js";
import { runFixtures, printEvalSummary } from "../../lib/evals/runFixtures.js";
import { runRequirementsGapAgent } from "./pipeline.js";
import { requirementsGapFixtures } from "./fixtures/index.js";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env or your shell environment.");
    process.exitCode = 1;
    return;
  }

  const sdk = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const client = new AnthropicClaudeClient(sdk);

  const summary = await runFixtures(requirementsGapFixtures, (input) =>
    runRequirementsGapAgent(input, { client })
  );

  printEvalSummary(summary);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
