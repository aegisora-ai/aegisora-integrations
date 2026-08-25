import { RunnableLambda } from "@langchain/core/runnables";
import { createLangChainIntegration } from "../src/index.js";

const runnable = RunnableLambda.from(
  async (input: string) => "LangChain runnable executed: " + input
);

const integration = createLangChainIntegration({
  runnable,
});

const allowed = await integration.execute({
  provider: "langchain",
  operation: "invoke",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("LangChain ALLOW decision failed.");
}

if(!allowed.output?.includes("LangChain runnable executed")){
  throw new Error("LangChain runnable did not execute.");
}

if(allowed.metadata?.provider !== "langchain"){
  throw new Error("LangChain metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "langchain",
  operation: "invoke",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("LangChain BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "langchain",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("LangChain ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "invoke",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("LangChain provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA LANGCHAIN ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("RUNNABLE_EXECUTION=PASS");
console.log("LANGCHAIN_ADAPTER_RESULT=PASS");
