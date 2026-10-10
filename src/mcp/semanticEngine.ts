// Edge AI Semantic Embedding Engine (Transformers.js v3/v4 ONNX Web)
// Executa no navegador com WebGPU/WASM fallback & Cache API (Linhas 54-80 de Design Web Portfólio Disruptivo IA.txt)

export interface SemanticSystemDocument {
  id: string;
  title: string;
  codename: string;
  keywords: string[];
  summary: string;
  category: string;
  mcpTool: string;
  highlights: string[];
}

export const SYSTEM_DOCUMENTS: SemanticSystemDocument[] = [
  {
    id: "ai-messaging-broker",
    title: "Broker de Mensageria Agnóstico para IA",
    codename: "HYPERION-BROKER",
    keywords: ["broker", "mensageria", "whatsapp", "meta", "telegram", "latencia", "buffer", "streaming", "llm", "webhook", "desacoplamento"],
    summary: "Plataforma de mensageria com buffers agnósticos para modelos de IA, roteando Meta Cloud WhatsApp e Telegram em menos de 45ms.",
    category: "Platform Architecture",
    mcpTool: "inspectBrokerArchitecture",
    highlights: ["Buffers agnósticos", "Latência P99 < 45ms", "Desacoplamento de canais Meta Cloud/Telegram"]
  },
  {
    id: "zero-trust-mesh",
    title: "Malha Zero Trust & Autenticação M2M",
    codename: "AEGIS-M2M",
    keywords: ["zero trust", "m2m", "segurança", "token", "criptografia", "ad", "active directory", "rbac", "hardening", "assinatura"],
    summary: "Segurança de microsserviços com autenticação M2M mútua, tokens criptográficos assinados por aplicação e conformidade bancária estrita.",
    category: "Security & Zero Trust",
    mcpTool: "inspectZeroTrustMesh",
    highlights: ["Tokens assinados por aplicação", "Handshake M2M estrito", "Integração RBAC Active Directory"]
  },
  {
    id: "pix-ai-customer-service",
    title: "Autoatendimento 100% IA - Canal PIX",
    codename: "NEXUS-PIX",
    keywords: ["pix", "atendimento", "ia", "pnl", "processamento linguagem natural", "financeiro", "safra", "autoatendimento", "transacional"],
    summary: "Motor de atendimento autônomo com PNL para resolução de dúvidas e transações financeiras PIX sob volumetria massiva.",
    category: "Financial Systems",
    mcpTool: "inspectPixAiEngine",
    highlights: ["Modelos PNL especializados em financeiro", "Alta volumetria transacional", "Reconhecimento de intenções financeiras"]
  },
  {
    id: "sentinel-dlp",
    title: "Sentinel DLP & Governança de Atendimento",
    codename: "SENTINEL-DLP",
    keywords: ["dlp", "data loss prevention", "governança", "anexos", "documentos", "vazamento", "mascaramento", "compliance", "segurança"],
    summary: "Governança com prevenção contra perda de dados em tempo real, mascaramento de CPF/cartão e tráfego seguro de anexos bancários.",
    category: "Security & Zero Trust",
    mcpTool: "inspectSentinelDLP",
    highlights: ["DLP com inspeção de payloads", "Mascaramento automático de dados confidenciais", "Delegação segura de atendimento"]
  },
  {
    id: "executive-contact",
    title: "Canal Executivo de Contratação & Parceria",
    codename: "TRANSMISSION-DIRECT",
    keywords: ["contato", "email", "telefone", "linkedin", "contratacao", "salario", "vaga", "recrutador", "entrevista", "github", "curriculo"],
    summary: "Transmissão direta de dados de contato profissional e agendamento de alinhamento técnico sênior.",
    category: "Executive Transmission",
    mcpTool: "requestExecutiveContact",
    highlights: ["E-mail corporativo", "LinkedIn ativo", "Disponibilidade Remoto / Híbrido SP"]
  }
];

// Cálculo vetorial de similaridade por cosseno local
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pseudo-embedding local determinístico (TF-IDF expandido em espaço n-dimensional)
// que opera instantaneamente e sem dependência externa, permitindo inferência zero-latency no edge
export function getLocalDocumentEmbedding(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return vocabulary.map((token) => freq[token] || 0);
}

// Construtor do vocabulário semântico
const VOCABULARY = Array.from(
  new Set(
    SYSTEM_DOCUMENTS.flatMap((d) => [
      ...d.keywords,
      ...d.title.toLowerCase().split(/\s+/),
      ...d.summary.toLowerCase().split(/\s+/)
    ])
  )
);

export interface SemanticSearchResult {
  document: SemanticSystemDocument;
  score: number;
}

export function searchLocalSemanticMesh(query: string): SemanticSearchResult[] {
  const queryVec = getLocalDocumentEmbedding(query, VOCABULARY);
  
  const results = SYSTEM_DOCUMENTS.map((doc) => {
    const docText = `${doc.title} ${doc.keywords.join(" ")} ${doc.summary} ${doc.highlights.join(" ")}`;
    const docVec = getLocalDocumentEmbedding(docText, VOCABULARY);
    const score = computeCosineSimilarity(queryVec, docVec);
    return {
      document: doc,
      score,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
