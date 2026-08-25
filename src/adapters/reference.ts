import type {
  IntegrationRequest,
  IntegrationResponse,
} from "../contracts/integration.js";
import { BaseIntegration } from "./base.js";

export class ReferenceIntegration extends BaseIntegration {
  readonly provider = "custom" as const;
  readonly name = "reference";

  protected async executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse> {
    if(request.operation === "production-deploy"){
      return {
        decision: "ESCALATE",
        output: "Human review required before production deployment.",
      };
    }

    return {
      decision: "ALLOW",
      output: "Reference integration executed: " + request.input,
      metadata: {
        provider: request.provider,
        operation: request.operation,
      },
    };
  }
}
