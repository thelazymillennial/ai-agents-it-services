import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicClaudeClient } from "../../lib/ai/claudeClient.js";
import { runFixtures, printEvalSummary } from "../../lib/evals/runFixtures.js";
import { runMeetingActionAgent } from "./pipeline.js";
import { meetingActionFixtures } from "./fixtures/index.js";

async function main() {
  const sdk = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const client = new AnthropicClaudeClient(sdk);

  const summary = await runFixtures(meetingActionFixtures, (input) =>
    runMeetingActionAgent(input, { client })
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
