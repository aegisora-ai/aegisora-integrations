import { createRequire } from "node:module";
import Anthropic from "@anthropic-ai/sdk";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface AnthropicIntegrationOptions {
  readonly apiKey?: string;
  readonly model?: string;
  readonly maxTokens?: number;
  readonly live?: boolean;
}

export class AnthropicIntegration extends BaseIntegration {
  readonly provider = "anthropic" as const;
  readonly name = "anthropic-messages";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly live: boolean;

  constructor(options: AnthropicIntegrationOptions = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
    this.maxTokens = options.maxTokens ?? 256;
    this.live = options.live ?? false;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before Anthropic execution.",
      };
    }

    const apiKey = this.apiKey;
    const model = this.model;
    const maxTokens = this.maxTokens;
    const live = this.live;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        if(!live){
          return "Deterministic Anthropic adapter execution: " + input;
        }

        if(!apiKey){
          throw new Error("ANTHROPIC_API_KEY is required for live Anthropic execution.");
        }

        const client = new Anthropic({
          apiKey,
        });

        const response = await client.messages.create({
          model,
          max_tokens: maxTokens,
          messages: [
            {
              role: "user",
              content: input,
            },
          ],
        });

        const text = response.content.find((item) => item.type === "text");

        if(!text || text.type !== "text"){
          throw new Error("Anthropic returned no text output.");
        }

        return text.text;
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "anthropic",
        model,
        mode: live ? "live" : "deterministic",
      },
    };
  }
}

export function createAnthropicIntegration(
  options: AnthropicIntegrationOptions = {}
): AnthropicIntegration {
  return new AnthropicIntegration(options);
}
