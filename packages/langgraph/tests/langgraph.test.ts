import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { createLangGraphIntegration } from "../src/index.js";

const State = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode("execute", async (state) => ({
    output: "LangGraph node executed: " + state.input,
  }))
  .addEdge(START, "execute")
  .addEdge("execute", END)
  .compile();

const integration = createLangGraphIntegration({
  graph,
  inputFactory: (input) => ({
    input,
  }),
});

const allowed = await integration.execute({
  provider: "langgraph",
  operation: "invoke",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("LangGraph ALLOW decision failed.");
}

if(!allowed.output?.includes("LangGraph node executed")){
  throw new Error("LangGraph graph did not execute.");
}

if(allowed.metadata?.provider !== "langgraph"){
  throw new Error("LangGraph metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "langgraph",
  operation: "invoke",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("LangGraph BLOCK boundary failed.");
}

const escalated = await integration.execute({
  provider: "langgraph",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("LangGraph ESCALATE boundary failed.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "invoke",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("LangGraph provider boundary failed.");
}

console.log("============================================================");
console.log("AEGISORA LANGGRAPH ADAPTER TEST");
console.log("============================================================");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("GRAPH_STATE_EXECUTION=PASS");
console.log("LANGGRAPH_ADAPTER_RESULT=PASS");
