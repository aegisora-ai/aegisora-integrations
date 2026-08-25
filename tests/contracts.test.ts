import { IntegrationRegistry } from "../src/adapters/registry.js";
import { ReferenceIntegration } from "../src/adapters/reference.js";

const reference = new ReferenceIntegration();
const registry = new IntegrationRegistry();

registry.register(reference);

if(!registry.has("custom")){
  throw new Error("Registry registration failed.");
}

if(registry.get("custom") !== reference){
  throw new Error("Registry lookup failed.");
}

const providers = registry.list();

if(providers.length !== 1 || providers[0] !== "custom"){
  throw new Error("Registry provider listing failed.");
}

const mismatch = await reference.execute({
  provider: "openai",
  operation: "execute",
  input: "test",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Provider mismatch boundary failed.");
}

const allowed = await reference.execute({
  provider: "custom",
  operation: "execute",
  input: "adapter-foundation-test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("ALLOW adapter contract failed.");
}

const blocked = await reference.execute({
  provider: "custom",
  operation: "execute",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("BLOCK adapter contract failed.");
}

const escalated = await reference.execute({
  provider: "custom",
  operation: "production-deploy",
  input: "release candidate",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("ESCALATE adapter contract failed.");
}

console.log("============================================================");
console.log("AEGISORA ADAPTER FOUNDATION TEST");
console.log("============================================================");
console.log("REGISTRY=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("ADAPTER_CONTRACT=PASS");
console.log("EXAMPLE_RESULT=PASS");
