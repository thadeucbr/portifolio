"use client";

import { createMCPClient } from "@ai-sdk/mcp";
import { useCallback, useEffect, useRef, useState } from "react";
import { verifyPortfolioToolManifest } from "@/mcp/portfolioToolPolicy.mjs";

type PortfolioMcpClient = Awaited<ReturnType<typeof createMCPClient>>;
export type PortfolioMcpTool = Awaited<ReturnType<PortfolioMcpClient["listTools"]>>["tools"][number];
type ToolResult = Awaited<ReturnType<PortfolioMcpClient["callTool"]>>;

export interface PortfolioMcpState {
  phase: "connecting" | "ready" | "error";
  detail?: string;
  serverName?: string;
  tools: PortfolioMcpTool[];
}

const initialState: PortfolioMcpState = { phase: "connecting", tools: [] };

/** Connects to the same-origin read-only MCP server and refuses contract drift. */
export function usePortfolioMcp() {
  const [state, setState] = useState<PortfolioMcpState>(initialState);
  const clientRef = useRef<PortfolioMcpClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    let connectingClient: PortfolioMcpClient | null = null;

    const connect = async () => {
      try {
        connectingClient = await createMCPClient({
          clientName: "thadeu-portfolio-browser",
          version: "1.0.0",
          initializationOptions: { timeout: 8_000 },
          transport: {
            type: "http",
            url: new URL("/api/mcp", window.location.origin).toString(),
            redirect: "error",
          },
        });

        const { tools } = await connectingClient.listTools({ options: { timeout: 8_000 } });
        const verification = verifyPortfolioToolManifest(tools);
        if (!verification.ok) throw new Error(`MCP tool trust check failed: ${verification.reason}`);

        if (cancelled) {
          await connectingClient.close();
          return;
        }

        clientRef.current = connectingClient;
        setState({ phase: "ready", serverName: connectingClient.serverInfo.name, tools });
      } catch (error) {
        if (!cancelled) {
          setState({
            phase: "error",
            detail: error instanceof Error ? error.message : "MCP connection failed.",
            tools: [],
          });
        }
        if (connectingClient) await connectingClient.close().catch(() => undefined);
      }
    };

    void connect();
    return () => {
      cancelled = true;
      clientRef.current = null;
      if (connectingClient) void connectingClient.close().catch(() => undefined);
    };
  }, []);

  const callTool = useCallback(async (name: string, args: Record<string, unknown>): Promise<ToolResult> => {
    const client = clientRef.current;
    if (!client) throw new Error("MCP client is not ready.");
    return client.callTool({ name, arguments: args, options: { timeout: 8_000 } });
  }, []);

  return { state, callTool };
}
