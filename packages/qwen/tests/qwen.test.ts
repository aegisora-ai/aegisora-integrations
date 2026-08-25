import { createQwenIntegration } from "../src/index.js";

const integration = createQwenIntegration({
  live: false,
});

const allowed = await integration.execute({
  provider: "qwen",
  operation: "generate",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("Qwen ALLOW decision failed.");
}

if(!allowed.output?.includes("Deterministic Qwen adapter execution")){
  throw new Error("Qwen deterministic execution failed.");
}

if(allowed.metadata?.provider !== "qwen"){
  throw new Error("Qwen metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "qwen",
  operation: "generate",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("Qwen BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "qwen",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("Qwen ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Qwen provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA QWEN ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("DETERMINISTIC_EXECUTION=PASS");
console.log("QWEN_ADAPTER_RESULT=PASS");
