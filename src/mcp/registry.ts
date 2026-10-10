// Contracts locais inspirados em MCP. Este registry não implementa cliente ou servidor MCP.
// As anotações são exibidas como demonstração no portfólio, não executadas pelo protocolo.

export interface MCPToolAnnotation {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  requiresElicitation?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations: MCPToolAnnotation;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const MCP_REGISTRY: Record<string, MCPToolDefinition> = {
  inspectBrokerArchitecture: {
    name: "inspectBrokerArchitecture",
    description: "Extrai métricas ao vivo, diagrama de buffer agnóstico e topologia do broker de mensageria para IA do Banco Safra.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      requiresElicitation: false,
    },
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Canal de entrada a analisar",
          enum: ["WhatsApp Meta Cloud", "Telegram Bot API", "Enterprise Webhook"],
        },
      },
      required: ["channel"],
    },
  },
  inspectZeroTrustMesh: {
    name: "inspectZeroTrustMesh",
    description: "Audita a malha M2M com handshake criptográfico, chaves assimétricas e RBAC integrado ao AD.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      requiresElicitation: false,
    },
    parameters: {
      type: "object",
      properties: {
        serviceId: {
          type: "string",
          description: "Identificador do microsserviço a auditar",
        },
      },
      required: ["serviceId"],
    },
  },
  inspectPixAiEngine: {
    name: "inspectPixAiEngine",
    description: "Inspeciona o motor transacional de autoatendimento 100% IA do PIX no Safra, com métricas de PNL e fallback de segurança.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      requiresElicitation: false,
    },
    parameters: {
      type: "object",
      properties: {
        intentCategory: {
          type: "string",
          description: "Intenção financeira a testar no motor de PNL",
          enum: ["chave_pix", "comprovante_reversao", "limite_noturno"],
        },
      },
      required: ["intentCategory"],
    },
  },
  inspectSentinelDLP: {
    name: "inspectSentinelDLP",
    description: "Executa validação de Data Loss Prevention (DLP) em tempo real sobre fluxos de atendimento corporativo e anexos bancários.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      requiresElicitation: false,
    },
    parameters: {
      type: "object",
      properties: {
        dataType: {
          type: "string",
          description: "Tipo de dado confidencial bancário para teste de mascaramento",
        },
      },
      required: ["dataType"],
    },
  },
  inspectEdgeInferenceRuntime: {
    name: "inspectEdgeInferenceRuntime",
    description: "Exibe a telemetria real do runtime de inferência desta página: modelo, backend (WebGPU/WASM), quantização, dimensões e estado do Cache API.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      requiresElicitation: false,
    },
    parameters: { type: "object", properties: {}, required: [] },
  },
  requestExecutiveContact: {
    name: "requestExecutiveContact",
    description: "Requer autorização de elicitação prévia para emitir dados executivos de contato e canal direto de contratação.",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      requiresElicitation: true,
    },
    parameters: {
      type: "object",
      properties: {
        recruiterIntent: {
          type: "string",
          description: "Motivo da solicitação de contato direto (ex: Vaga Sênior/Staff, Consultoria)",
        },
      },
      required: ["recruiterIntent"],
    },
  },
};
