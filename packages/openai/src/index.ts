import { createRequire } from "node:module";
import OpenAI from "openai";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface OpenAIIntegrationOptions {
  readonly apiKey?: string;
  readonly model?: string;
  readonly baseURL?: string;
  readonly live?: boolean;
}

export class OpenAIIntegration extends BaseIntegration {
  readonly provider = "openai" as const;
  readonly name = "openai-responses";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly baseURL?: string;
  private readonly live: boolean;

  constructor(options: OpenAIIntegrationOptions = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.5";
    this.baseURL = options.baseURL;
    this.live = options.live ?? false;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before OpenAI execution.",
      };
    }

    const apiKey = this.apiKey;
    const model = this.model;
    const baseURL = this.baseURL;
    const live = this.live;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        if(!live){
          return "Deterministic OpenAI adapter execution: " + input;
        }

        if(!apiKey){
          throw new Error("OPENAI_API_KEY is required for live OpenAI execution.");
        }

        const client = new OpenAI({
          apiKey,
          baseURL,
        });

        const response = await client.responses.create({
          model,
          input,
        });

        return response.output_text;
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "openai",
        model,
        mode: live ? "live" : "deterministic",
      },
    };
  }
}

export function createOpenAIIntegration(
  options: OpenAIIntegrationOptions = {}
): OpenAIIntegration {
  return new OpenAIIntegration(options);
}
