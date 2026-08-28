import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicClaudeClient } from "../../lib/ai/claudeClient.js";
import { runMeetingActionAgent } from "./pipeline.js";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npm run meeting-action -w @ai-agents-it-services/core -- <path-to-transcript.txt|.md>");
    process.exitCode = 1;
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env or your shell environment.");
    process.exitCode = 1;
    return;
  }

  const sdk = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const client = new AnthropicClaudeClient(sdk);

  const result = await runMeetingActionAgent({ filePath }, { client });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
