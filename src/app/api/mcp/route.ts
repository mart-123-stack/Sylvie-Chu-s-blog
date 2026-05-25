import { NextRequest } from "next/server";

const MCP_TARGET = process.env.MCP_SERVER_URL || "http://mcp-server:3100/mcp";

export async function POST(request: NextRequest) {
  const accept = request.headers.get("accept") || "application/json, text/event-stream";
  const body = await request.text();

  const response = await fetch(MCP_TARGET, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: accept,
    },
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

  const response = await fetch(MCP_TARGET, {
    method: "GET",
    headers: { Accept: accept },
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
