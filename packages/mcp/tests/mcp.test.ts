import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { createMCPIntegration } from "../src/index.js";

const server = new McpServer({
  name: "aegisora-mcp-test-server",
  version: "0.1.2",
});

let toolExecutionCount = 0;

server.registerTool(
  "echo",
  {
    description: "Echo a governed value.",
    inputSchema: z.object({
      input: z.string(),
    }),
  },
  async ({ input }) => {
    toolExecutionCount += 1;

    return {
      content: [
        {
          type: "text",
          text: "MCP tool executed: " + input,
        },
      ],
    };
  }
);

const [clientTransport, serverTransport] =
  InMemoryTransport.createLinkedPair();

const client = new Client({
  name: "aegisora-mcp-test-client",
  version: "0.1.2",
});

await server.connect(serverTransport);
await client.connect(clientTransport);

const integration = createMCPIntegration({
  client,
  toolName: "echo",
  argumentsFactory: (input) => ({
    input,
  }),
});

const tools = await client.listTools();

if(!tools.tools.some((tool) => tool.name === "echo")){
  throw new Error("MCP tool discovery failed.");
}

const allowed = await integration.execute({
  provider: "mcp",
  operation: "call-tool",
  input: "adapter foundation test",
});

if(allowed.decision !== "ALLOW"){
  throw new Error("MCP ALLOW decision failed.");
}

if(!allowed.output?.includes("MCP tool executed")){
  throw new Error("MCP tool execution failed.");
}

if(toolExecutionCount !== 1){
  throw new Error("Unexpected MCP execution count after ALLOW.");
}

if(allowed.metadata?.provider !== "mcp"){
  throw new Error("MCP metadata provider mismatch.");
}

const blocked = await integration.execute({
  provider: "mcp",
  operation: "call-tool",
  input: "",
});

if(blocked.decision !== "BLOCK"){
  throw new Error("MCP BLOCK boundary failed.");
}

if(toolExecutionCount !== 1){
  throw new Error("BLOCKED MCP request crossed the execution boundary.");
}

const escalated = await integration.execute({
  provider: "mcp",
  operation: "production-deploy",
  input: "release",
});

if(escalated.decision !== "ESCALATE"){
  throw new Error("MCP ESCALATE boundary failed.");
}

if(toolExecutionCount !== 1){
  throw new Error("ESCALATED MCP request crossed the execution boundary.");
}

const mismatch = await integration.execute({
  provider: "openai",
  operation: "call-tool",
  input: "wrong provider",
});

if(mismatch.decision !== "BLOCK"){
  throw new Error("MCP provider boundary failed.");
}

if(toolExecutionCount !== 1){
  throw new Error("Provider mismatch crossed the MCP execution boundary.");
}

await client.close();

console.log("============================================================");
console.log("AEGISORA MCP ADAPTER TEST");
console.log("============================================================");
console.log("MCP_HANDSHAKE=PASS");
console.log("TOOL_DISCOVERY=PASS");
console.log("ALLOW=PASS");
console.log("BLOCK=PASS");
console.log("ESCALATE=PASS");
console.log("PROVIDER_BOUNDARY=PASS");
console.log("EXECUTION_BOUNDARY=PASS");
console.log("MCP_ADAPTER_RESULT=PASS");
