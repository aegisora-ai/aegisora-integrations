import { createRequire } from "node:module";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface MCPToolClient {
  listTools(): Promise<{
    tools: Array<{
      name: string;
    }>;
  }>;

  callTool(request: {
    name: string;
    arguments?: Record<string, unknown>;
  }): Promise<{
    content?: Array<{
      type: string;
      text?: string;
    }>;
    isError?: boolean;
  }>;
}

export interface MCPIntegrationOptions {
  readonly client: MCPToolClient;
  readonly toolName: string;
  readonly argumentsFactory?: (input: string) => Record<string, unknown>;
}

export class MCPIntegration extends BaseIntegration {
  readonly provider = "mcp" as const;
  readonly name = "mcp-tool";

  private readonly client: MCPToolClient;
  private readonly toolName: string;
  private readonly argumentsFactory: (input: string) => Record<string, unknown>;

  constructor(options: MCPIntegrationOptions) {
    super();
    this.client = options.client;
    this.toolName = options.toolName;
    this.argumentsFactory =
      options.argumentsFactory ??
      ((input) => ({ input }));
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before MCP tool execution.",
      };
    }

    const client = this.client;
    const toolName = this.toolName;
    const argumentsFactory = this.argumentsFactory;

    const tools = await client.listTools();
    const toolExists = tools.tools.some((tool) => tool.name === toolName);

    if(!toolExists){
      return {
        decision: "BLOCK",
        output: `MCP tool is not registered: ${toolName}.`,
      };
    }

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        const result = await client.callTool({
          name: toolName,
          arguments: argumentsFactory(input),
        });

        if(result.isError){
          const text = result.content?.find(
            (item) => item.type === "text" && item.text
          )?.text;

          throw new Error(text ?? `MCP tool failed: ${toolName}`);
        }

        const output = result.content?.find(
          (item) => item.type === "text" && item.text
        )?.text;

        if(!output){
          throw new Error(`MCP tool returned no text output: ${toolName}`);
        }

        return output;
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "mcp",
        adapter: "mcp-tool",
        tool: toolName,
      },
    };
  }
}

export function createMCPIntegration(
  options: MCPIntegrationOptions
): MCPIntegration {
  return new MCPIntegration(options);
}
