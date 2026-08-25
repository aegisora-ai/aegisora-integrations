import { createRequire } from "node:module";
import type {
  IntegrationRequest,
  IntegrationResponse,
} from "@aegisora/integrations-core";
import { BaseIntegration } from "@aegisora/integrations-core";

const require = createRequire(import.meta.url);
const { Aegisora } = require("@aegisora/sdk") as typeof import("@aegisora/sdk");

export interface LangGraphRunnable {
  invoke(input: unknown): Promise<unknown>;
}

export interface LangGraphIntegrationOptions {
  readonly graph: LangGraphRunnable;
  readonly inputFactory?: (input: string) => unknown;
}

export class LangGraphIntegration extends BaseIntegration {
  readonly provider = "langgraph" as const;
  readonly name = "langgraph-graph";

  private readonly graph: LangGraphRunnable;
  private readonly inputFactory: (input: string) => unknown;

  constructor(options: LangGraphIntegrationOptions) {
    super();
    this.graph = options.graph;
    this.inputFactory = options.inputFactory ?? ((input) => input);
  }

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before LangGraph execution.",
      };
    }

    const graph = this.graph;
    const inputFactory = this.inputFactory;

    const protectedExecution = Aegisora.protect({
      async run(input: string) {
        const graphInput = inputFactory(input);
        const result = await graph.invoke(graphInput);

        if(typeof result === "string"){
          return result;
        }

        return JSON.stringify(result);
      },
    });

    const execution = await protectedExecution.run({
      input: request.input,
    });

    return {
      decision: "ALLOW",
      output: execution.output,
      metadata: {
        provider: "langgraph",
        adapter: "langgraph-graph",
      },
    };
  }
}

export function createLangGraphIntegration(
  options: LangGraphIntegrationOptions
): LangGraphIntegration {
  return new LangGraphIntegration(options);
}
