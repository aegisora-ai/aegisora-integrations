import { createOpenAIIntegration } from "../src/index.js";

const integration = createOpenAIIntegration({
  live: false,
});

const allowed = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("OpenAI ALLOW decision failed.");
}

if(!allowed.output?.includes("Deterministic OpenAI adapter execution")){
  throw new Error("OpenAI deterministic execution failed.");
}

if(allowed.metadata?.provider !== "openai"){
  throw new Error("OpenAI metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("OpenAI BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "openai",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("OpenAI ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "anthropic",
  operation: "generate",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("OpenAI provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA OPENAI ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("DETERMINISTIC_EXECUTION=PASS");
console.log("OPENAI_ADAPTER_RESULT=PASS");
