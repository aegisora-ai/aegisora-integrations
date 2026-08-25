import { createRequire } from "node:module";
import { RunnableLambda } from "@langchain/core/runnables";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface LangChainRunnable {
  invoke(input: string): Promise<unknown>;
}

export interface LangChainIntegrationOptions {
  readonly runnable: LangChainRunnable;
}

export class LangChainIntegration extends BaseIntegration {
  readonly provider = "langchain" as const;
  readonly name = "langchain-runnable";

  private readonly runnable: LangChainRunnable;

  constructor(options: LangChainIntegrationOptions) {
    super();
    this.runnable = options.runnable;
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before LangChain execution.",
      };
    }

    const runnable = this.runnable;

    const governedRunnable = RunnableLambda.from(
      async (input: string) => {
        const result = await runnable.invoke(input);

        if(typeof result === "string"){
          return result;
        }

        return JSON.stringify(result);
      }
    );

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        const result = await governedRunnable.invoke(input);
        return result;
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "langchain",
        adapter: "langchain-runnable",
      },
    };
  }
}

export function createLangChainIntegration(
  options: LangChainIntegrationOptions
): LangChainIntegration {
  return new LangChainIntegration(options);
}
