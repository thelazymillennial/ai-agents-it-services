import { describe, expect, it } from "vitest";
import { AnthropicClaudeClient } from "./claudeClient.js";

describe("AnthropicClaudeClient", () => {
  it("extracts the tool_use block's input", async () => {
    const fakeSdk = {
      messages: {
        create: async () => ({
          content: [
            { type: "text", text: "thinking..." },
            { type: "tool_use", input: { summary: "hi" } },
          ],
        }),
      },
    };

    const client = new AnthropicClaudeClient(fakeSdk);
    const result = await client.callTool({
      system: "sys",
      userMessage: "user",
      tool: { name: "emit", description: "d", input_schema: {} },
      model: "claude-sonnet-5",
    });

    expect(result).toEqual({ summary: "hi" });
  });

  it("throws when there is no tool_use block", async () => {
    const fakeSdk = {
      messages: {
        create: async () => ({ content: [{ type: "text", text: "oops" }] }),
      },
    };

    const client = new AnthropicClaudeClient(fakeSdk);
    await expect(
      client.callTool({
        system: "sys",
        userMessage: "user",
        tool: { name: "emit", description: "d", input_schema: {} },
        model: "claude-sonnet-5",
      })
    ).rejects.toThrow(/did not contain a tool_use block/);
  });

  it("sends the correct request shape to the SDK", async () => {
    let capturedParams: Record<string, unknown> | undefined;
    const fakeSdk = {
      messages: {
        create: async (params: Record<string, unknown>) => {
          capturedParams = params;
          return { content: [{ type: "tool_use", input: {} }] };
        },
      },
    };

    const client = new AnthropicClaudeClient(fakeSdk);
    await client.callTool({
      system: "sys",
      userMessage: "user",
      tool: { name: "emit", description: "d", input_schema: { type: "object" } },
      model: "claude-sonnet-5",
    });

    expect(capturedParams).toMatchObject({
      model: "claude-sonnet-5",
      system: "sys",
      messages: [{ role: "user", content: "user" }],
      tools: [{ name: "emit", description: "d", input_schema: { type: "object" } }],
      tool_choice: { type: "tool", name: "emit" },
    });
  });
});
