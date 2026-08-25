import { createRequire } from "node:module";
import { GoogleGenAI } from "@google/genai";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface GoogleIntegrationOptions {
  readonly apiKey?: string;
  readonly model?: string;
  readonly live?: boolean;
}

export class GoogleIntegration extends BaseIntegration {
  readonly provider = "google" as const;
  readonly name = "google-gemini";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly live: boolean;

  constructor(options: GoogleIntegrationOptions = {}) {
    super();
    this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    this.model = options.model ?? process.env.GEMINI_MODEL ?? "gemini-3.7-flash";
    this.live = options.live ?? false;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before Google Gemini execution.",
      };
    }

    const apiKey = this.apiKey;
    const model = this.model;
    const live = this.live;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        if(!live){
          return "Deterministic Google adapter execution: " + input;
        }

        if(!apiKey){
          throw new Error("GEMINI_API_KEY is required for live Google execution.");
        }

        const ai = new GoogleGenAI({
          apiKey,
        });

        const response = await ai.models.generateContent({
          model,
          contents: input,
        });

        if(!response.text){
          throw new Error("Google Gemini returned no text output.");
        }

        return response.text;
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "google",
        model,
        mode: live ? "live" : "deterministic",
      },
    };
  }
}

export function createGoogleIntegration(
  options: GoogleIntegrationOptions = {}
): GoogleIntegration {
  return new GoogleIntegration(options);
}
