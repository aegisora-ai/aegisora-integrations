import type { AegisoraIntegration, IntegrationProvider } from "../contracts/integration.js";

export class IntegrationRegistry {
  private readonly integrations = new Map<
    IntegrationProvider,
    AegisoraIntegration
  >();

  register(integration: AegisoraIntegration): void {
    if(this.integrations.has(integration.provider)){
      throw new Error(`Integration already registered: ${integration.provider}`);
    }

    this.integrations.set(integration.provider, integration);
  }

  get(provider: IntegrationProvider): AegisoraIntegration {
    const integration = this.integrations.get(provider);

    if(!integration){
      throw new Error(`Integration not registered: ${provider}`);
    }

    return integration;
  }

  has(provider: IntegrationProvider): boolean {
    return this.integrations.has(provider);
  }

  list(): IntegrationProvider[] {
    return [...this.integrations.keys()];
  }
}
