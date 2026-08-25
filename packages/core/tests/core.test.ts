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

const mismatch = await reference.execute({
  provider: "openai",
  operation: "execute",
  input: "test",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Provider boundary failed.");
}

const allowed = await reference.execute({
  provider: "custom",
  operation: "execute",
  input: "foundation-test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("ALLOW failed.");
}

const blocked = await reference.execute({
  provider: "custom",
  operation: "execute",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("BLOCK failed.");
}

const escalated = await reference.execute({
  provider: "custom",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("ESCALATE failed.");
}

console.log("CORE_REGISTRY=PASS");
console.log("CORE_BOUNDARY=PASS");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("CORE_RESULT=PASS");
