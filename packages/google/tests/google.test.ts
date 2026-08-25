import { createGoogleIntegration } from "../src/index.js";

const integration = createGoogleIntegration({
  live: false,
});

const allowed = await integration.execute({
  provider: "google",
  operation: "generate",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("Google ALLOW decision failed.");
}

if(!allowed.output?.includes("Deterministic Google adapter execution")){
  throw new Error("Google deterministic execution failed.");
}

if(allowed.metadata?.provider !== "google"){
  throw new Error("Google metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "google",
  operation: "generate",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("Google BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "google",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("Google ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "generate",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("Google provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA GOOGLE ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("DETERMINISTIC_EXECUTION=PASS");
console.log("GOOGLE_ADAPTER_RESULT=PASS");
