import { createGroqIntegration } from "../src/index.js";

const integration = createGroqIntegration({
  live: false,
});

const allowed = await integration.execute({
  provider: "groq",
  operation: "generate",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("Groq ALLOW decision failed.");
}

if(!allowed.output?.includes("Deterministic Groq adapter execution")){
  throw new Error("Groq deterministic execution failed.");
}

if(allowed.metadata?.provider !== "groq"){
  throw new Error("Groq metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "groq",
  operation: "generate",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("Groq BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "groq",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("Groq ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Groq provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA GROQ ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("DETERMINISTIC_EXECUTION=PASS");
console.log("GROQ_ADAPTER_RESULT=PASS");
