import Groq from "groq-sdk";
import { createRequire } from "node:module";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface GroqIntegrationOptions {
  readonly apiKey?: string;
  readonly model?: string;
  readonly live?: boolean;
}

export class GroqIntegration extends BaseIntegration {
  readonly provider = "groq" as const;
  readonly name = "groq-chat-completions";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly live: boolean;

  constructor(options: GroqIntegrationOptions = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
    this.model = options.model ?? process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";
    this.live = options.live ?? false;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before Groq execution.",
      };
    }

    const apiKey = this.apiKey;
    const model = this.model;
    const live = this.live;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        if(!live){
          return "Deterministic Groq adapter execution: " + input;
        }

        if(!apiKey){
          throw new Error("GROQ_API_KEY is required for live Groq execution.");
        }

        const client = new Groq({
          apiKey,
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
          throw new Error("Groq returned no text output.");
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
        provider: "groq",
        model,
        mode: live ? "live" : "deterministic",
      },
    };
  }
}

export function createGroqIntegration(
  options: GroqIntegrationOptions = {}
): GroqIntegration {
  return new GroqIntegration(options);
}
