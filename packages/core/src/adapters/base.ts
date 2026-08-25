import type {
  AegisoraIntegration,
  IntegrationRequest,
  IntegrationResponse,
} from "../contracts/integration.js";

export abstract class BaseIntegration implements AegisoraIntegration {
  abstract readonly provider: AegisoraIntegration["provider"];
  abstract readonly name: string;

  protected abstract executeGoverned(
    request: IntegrationRequest
  ): Promise<IntegrationResponse>;

  async execute(request: IntegrationRequest): Promise<IntegrationResponse> {
    if(request.provider !== this.provider){
      return {
        decision: "BLOCK",
        output: `Provider mismatch: expected ${this.provider}, received ${request.provider}.`,
      };
    }

    if(!request.input.trim()){
      return {
        decision: "BLOCK",
        output: "Integration request blocked: empty input.",
      };
    }

    return this.executeGoverned(request);
  }
}
