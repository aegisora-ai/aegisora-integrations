import OpenAI from "openai";
import { createRequire } from "node:module";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface QwenIntegrationOptions {
  readonly apiKey?: string;
  readonly baseURL?: string;
  readonly model?: string;
  readonly live?: boolean;
}

export class QwenIntegration extends BaseIntegration {
  readonly provider = "qwen" as const;
  readonly name = "qwen-openai-compatible";

  private readonly apiKey?: string;
  private readonly baseURL?: string;
  private readonly model: string;
  private readonly live: boolean;

  constructor(options: QwenIntegrationOptions = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.QWEN_API_KEY ?? process.env.DASHSCOPE_API_KEY;
    this.baseURL = options.baseURL ?? process.env.QWEN_BASE_URL;
    this.model = options.model ?? process.env.QWEN_MODEL ?? "qwen-plus";
    this.live = options.live ?? false;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before Qwen execution.",
      };
    }

    const apiKey = this.apiKey;
    const baseURL = this.baseURL;
    const model = this.model;
    const live = this.live;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        if(!live){
          return "Deterministic Qwen adapter execution: " + input;
        }

        if(!apiKey){
          throw new Error("QWEN_API_KEY or DASHSCOPE_API_KEY is required for live Qwen execution.");
        }

        if(!baseURL){
          throw new Error("QWEN_BASE_URL is required for live Qwen execution.");
        }

        const client = new OpenAI({
          apiKey,
          baseURL,
        });

        const response = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: input,
            },
          ],
        });

        const output = response.choices[0]?.message?.content;

        if(!output){
          throw new Error("Qwen returned no text output.");
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
        provider: "qwen",
        model,
        mode: live ? "live" : "deterministic",
        baseURL: live ? baseURL : undefined,
      },
    };
  }
}

export function createQwenIntegration(
  options: QwenIntegrationOptions = {}
): QwenIntegration {
  return new QwenIntegration(options);
}
