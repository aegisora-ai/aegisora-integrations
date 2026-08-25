export type GovernanceDecision =
  | "ALLOW"
  | "BLOCK"
  | "ESCALATE";

export type IntegrationProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "qwen"
  | "langchain"
  | "langgraph"
  | "mcp"
  | "custom";

export interface IntegrationRequest {
  readonly provider: IntegrationProvider;
  readonly operation: string;
  readonly input: string;
}

export interface IntegrationResponse {
  readonly decision: GovernanceDecision;
  readonly output?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AegisoraIntegration {
  readonly provider: IntegrationProvider;
  readonly name: string;
  execute(request: IntegrationRequest): Promise<IntegrationResponse>;
}
