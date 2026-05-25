import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { pool, TOOLS, handleTool } from "./tools.js";

const server = new Server(
  { name: "blog-manager", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await handleTool(request.params.name, request.params.arguments ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }],
    };
  }
});

async function main() {
  try {
    await pool.query("SELECT 1");
    console.error("✅ Blog MCP Server connected to database");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }

  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);

  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("POST /mcp error:", err);
      if (!res.headersSent) res.status(500).json({ error: String(err) });
    }
  });

  app.get("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res);
    } catch (err) {
      console.error("GET /mcp error:", err);
      if (!res.headersSent) res.status(500).json({ error: String(err) });
    }
  });

  const port = parseInt(process.env.PORT || "3100", 10);
  app.listen(port, "0.0.0.0", () => {
    console.error(`📝 Blog MCP Server running on http://0.0.0.0:${port}/mcp`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
