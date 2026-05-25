import { NextRequest } from "next/server";

const MCP_TARGET = process.env.MCP_SERVER_URL || "http://mcp-server:3100/mcp";

export async function POST(request: NextRequest) {
  const accept = request.headers.get("accept") || "application/json, text/event-stream";
  const body = await request.text();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: accept,
  };

  const sessionId = request.headers.get("mcp-session-id");
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  const response = await fetch(MCP_TARGET, {
    method: "POST",
    headers,
    body,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function GET(request: NextRequest) {
  const accept = request.headers.get("accept") || "text/event-stream";

  const headers: Record<string, string> = { Accept: accept };

  const sessionId = request.headers.get("mcp-session-id");
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  const response = await fetch(MCP_TARGET, {
    method: "GET",
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
