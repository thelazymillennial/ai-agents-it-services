export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export type ToolCallRequest = {
  system: string;
  userMessage: string;
  tool: ToolDefinition;
  model: string;
};

export interface ClaudeClient {
  callTool(request: ToolCallRequest): Promise<unknown>;
}

type AnthropicMessagesClient = {
  messages: {
    create(params: unknown): Promise<{
      content: Array<{ type: string; input?: unknown }>;
    }>;
  };
};

export class AnthropicClaudeClient implements ClaudeClient {
  constructor(private readonly sdk: AnthropicMessagesClient) {}

  async callTool(request: ToolCallRequest): Promise<unknown> {
    const response = await this.sdk.messages.create({
      model: request.model,
      max_tokens: 4096,
      system: request.system,
      messages: [{ role: "user", content: request.userMessage }],
      tools: [request.tool],
      tool_choice: { type: "tool", name: request.tool.name },
    });

    const toolUseBlock = response.content.find(
      (block) => block.type === "tool_use"
    );

    if (!toolUseBlock) {
      throw new Error("Claude response did not contain a tool_use block");
    }

    return toolUseBlock.input;
  }
}
