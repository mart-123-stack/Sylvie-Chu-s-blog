import http from "http";
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

  const httpServer = http.createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/mcp") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks).toString();
        const parsed = body ? JSON.parse(body) : undefined;
        await transport.handleRequest(req, res, parsed);
      } else if (req.method === "GET" && req.url === "/mcp") {
        await transport.handleRequest(req, res);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    } catch (err: any) {
      console.error("HTTP error:", err?.message || err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err?.message || String(err) }));
      }
    }
  });

  const port = parseInt(process.env.PORT || "3100", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    console.error(`📝 Blog MCP Server running on http://0.0.0.0:${port}/mcp`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
