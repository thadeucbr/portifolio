"use client";

import { createMCPClient } from "@ai-sdk/mcp";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { verifyPortfolioToolManifest } from "@/mcp/portfolioToolPolicy.mjs";
import {
  createPortfolioContactElicitationHandler,
  type PortfolioContactElicitationResponse,
} from "@/mcp/contactElicitation.mjs";

type PortfolioMcpClient = Awaited<ReturnType<typeof createMCPClient>>;
export type PortfolioMcpTool = Awaited<ReturnType<PortfolioMcpClient["listTools"]>>["tools"][number];
type ToolResult = Awaited<ReturnType<PortfolioMcpClient["callTool"]>>;

export interface PortfolioMcpState {
  phase: "connecting" | "ready" | "error";
  detail?: string;
  serverName?: string;
  tools: PortfolioMcpTool[];
}

export interface PortfolioContactResult {
  status: "accepted" | "declined" | "cancelled" | "error";
  message: string;
  receiptId?: string;
}

const initialState: PortfolioMcpState = { phase: "connecting", tools: [] };

/** Connects to the same-origin MCP server and refuses any tool-manifest drift. */
export function usePortfolioMcp() {
  const [state, setState] = useState<PortfolioMcpState>(initialState);
  const [contactElicitation, setContactElicitation] = useState<string | null>(null);
  const clientRef = useRef<PortfolioMcpClient | null>(null);
  const contactResolverRef = useRef<((response: PortfolioContactElicitationResponse) => void) | null>(null);

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

  const respondToContactElicitation = useCallback((response: PortfolioContactElicitationResponse) => {
    const resolve = contactResolverRef.current;
    if (!resolve) return;
    contactResolverRef.current = null;
    setContactElicitation(null);
    resolve(response);
  }, []);

  const requestContact = useCallback(async (): Promise<PortfolioContactResult> => {
    if (contactResolverRef.current) throw new Error("A contact elicitation is already open.");

    const client = new Client(
      { name: "thadeu-portfolio-contact-browser", version: "1.0.0" },
      {
        versionNegotiation: { mode: "auto" },
        capabilities: { elicitation: { form: {} } },
        inputRequired: { autoFulfill: true, maxRounds: 2 },
      },
    );
    const transport = new StreamableHTTPClientTransport(
      new URL("/api/mcp", window.location.origin),
      { fetch: (url, init) => fetch(url, { ...init, redirect: "error" }) },
    );

    client.setRequestHandler("elicitation/create", createPortfolioContactElicitationHandler((message) =>
      new Promise((resolve) => {
        contactResolverRef.current = resolve;
        setContactElicitation(message);
      }),
    ));

    try {
      await client.connect(transport);
      const { tools } = await client.listTools();
      const verification = verifyPortfolioToolManifest(tools);
      if (!verification.ok) throw new Error(`MCP tool trust check failed: ${verification.reason}`);

      const contactTool = tools.find((tool) => tool.name === "portfolio_request_contact");
      if (!contactTool || contactTool.annotations?.destructiveHint !== true || contactTool.annotations?.readOnlyHint !== false) {
        throw new Error("The consent-gated MCP contact tool is unavailable or changed.");
      }

      const response = await client.callTool({ name: contactTool.name, arguments: {} });
      if (response.isError) throw new Error("MCP server rejected the contact request.");
      const result = response.structuredContent as PortfolioContactResult | undefined;
      if (!result || !["accepted", "declined", "cancelled", "error"].includes(result.status) || typeof result.message !== "string") {
        throw new Error("MCP server returned an invalid contact response.");
      }
      return result;
    } finally {
      respondToContactElicitation({ action: "cancel" });
      await client.close().catch(() => undefined);
    }
  }, [respondToContactElicitation]);

  useEffect(() => () => {
    const resolve = contactResolverRef.current;
    contactResolverRef.current = null;
    resolve?.({ action: "cancel" });
  }, []);

  return { state, callTool, requestContact, contactElicitation, respondToContactElicitation };
}
