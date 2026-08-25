import { createAnthropicIntegration } from "../src/index.js";

const integration = createAnthropicIntegration({
  live: false,
});

const allowed = await integration.execute({
  provider: "anthropic",
  operation: "generate",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("Anthropic ALLOW decision failed.");
}

if(!allowed.output?.includes("Deterministic Anthropic adapter execution")){
  throw new Error("Anthropic deterministic execution failed.");
}

if(allowed.metadata?.provider !== "anthropic"){
  throw new Error("Anthropic metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "anthropic",
  operation: "generate",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("Anthropic BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "anthropic",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("Anthropic ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Anthropic provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA ANTHROPIC ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("DETERMINISTIC_EXECUTION=PASS");
console.log("ANTHROPIC_ADAPTER_RESULT=PASS");
