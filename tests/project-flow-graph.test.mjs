import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectFlowGraph } from "../src/components/projects/projectFlowGraph.mjs";

test("builds ordered architecture nodes and directed edges from MCP project steps", () => {
  const graph = buildProjectFlowGraph([
    { step: "INGRESS", title: "Entrada", description: "Recebe", tech: "HTTP" },
    { step: "ROUTE", title: "Roteador", description: "Decide", tech: "TypeScript" },
    { step: "MODEL", title: "Modelo", description: "Gera", tech: "ONNX" },
  ]);

  assert.deepEqual(graph.nodes.map(({ id, order, title }) => ({ id, order, title })), [
    { id: "INGRESS", order: 1, title: "Entrada" },
    { id: "ROUTE", order: 2, title: "Roteador" },
    { id: "MODEL", order: 3, title: "Modelo" },
  ]);
  assert.deepEqual(graph.edges, [
    { from: "INGRESS", to: "ROUTE" },
    { from: "ROUTE", to: "MODEL" },
  ]);
});

test("returns a safe empty graph for empty or malformed tool content", () => {
  assert.deepEqual(buildProjectFlowGraph([]), { nodes: [], edges: [] });
  assert.deepEqual(buildProjectFlowGraph(null), { nodes: [], edges: [] });
});
