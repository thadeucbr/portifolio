export interface SystemProject {
  id: string;
  title: string;
  codename: string;
  category: "Platform Architecture" | "Security & Zero Trust" | "Edge AI & Multi-Agent" | "Financial Systems";
  organization: string;
  period: string;
  summary: string;
  architectureHighlights: string[];
  stack: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  flowDiagram?: string;
}

export const PROFILE_DATA = {
  name: "Thadeu Castelo Branco Ramos",
  role: "Senior Software Engineer",
  specialization: "Backend & Platform Architecture / AI Systems",
  location: "São Paulo, SP - Brasil",
  availability: "Remoto / Híbrido",
  contact: {
    email: "thadeucbr@gmail.com",
    phone: "+55 (11) 97170-4940",
    linkedin: "https://linkedin.com/in/thadeucbr",
    github: "https://github.com/thadeucbr",
    portfolio: "https://thadeucbr.github.io"
  },
  summary: "Engenheiro de Software Sênior com sólida trajetória no desenho, implementação e sustentação de plataformas de mensageria distribuída de alta volumetria, segurança corporativa Zero Trust e integração de ecossistemas de Inteligência Artificial no setor financeiro.",
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "C2 Proficient (EF SET 75/100)" }
  ],
  education: [
    {
      degree: "Pós-Graduação em Inteligência Artificial e Aprendizado de Máquina",
      institution: "PUC Minas",
      year: "2026"
    },
    {
      degree: "Tecnologia em Análise e Desenvolvimento de Sistemas",
      institution: "Descomplica Faculdade Digital",
      year: "2024"
    }
  ]
};

export const SYSTEMS_DATA: SystemProject[] = [
  {
    id: "ai-messaging-broker",
    title: "Broker de Mensageria Agnóstico para IA",
    codename: "HYPERION-BROKER",
    category: "Platform Architecture",
    organization: "Banco Safra",
    period: "2026",
    summary: "Plataforma escalável capaz de receber fluxos de múltiplos canais (WhatsApp, Telegram, integrações corporativas) e roteá-los em tempo real diretamente para o ecossistema de modelos de IA, com desacoplamento arquitetural absoluto.",
    architectureHighlights: [
      "Buffers agnósticos com desacoplamento de canais de entrada e saída",
      "Webhooks de alta disponibilidade integrados à Meta Cloud API (WhatsApp Platform + COEX)",
      "Camada de ferramentas dinâmicas para agentes (listas, botões, validação de biometria facial)",
      "Callbacks assíncronos de alta confiabilidade sob pico transacional"
    ],
    stack: ["Node.js", "TypeScript", "Meta Cloud API", "Redis", "Kafka/RabbitMQ Pattern", "Docker"],
    metrics: [
      { label: "Latência Média", value: "< 45ms" },
      { label: "Canais Conectados", value: "3+ Simultâneos" },
      { label: "Disponibilidade", value: "99.99%" }
    ]
  },
  {
    id: "zero-trust-mesh",
    title: "Malha Zero Trust & Autenticação M2M Criptográfica",
    codename: "AEGIS-M2M",
    category: "Security & Zero Trust",
    organization: "Banco Safra",
    period: "2026",
    summary: "Hardening e arquitetura Zero Trust eliminando pontos cegos na malha de microsserviços via autenticação máquina-a-máquina com tokens criptográficos assinados por aplicação e rastreabilidade ponta a ponta.",
    architectureHighlights: [
      "Tokens criptográficos assinados individualmente por aplicação (M2M)",
      "Role-Based Access Control (RBAC) com sincronização em tempo real ao Active Directory",
      "mTLS e eliminação rigorosa de segredos compartilhados",
      "Auditoria contínua e não-repúdio de chamadas entre microsserviços"
    ],
    stack: ["Go", "Node.js", "Cryptography / JWT", "Active Directory", "mTLS", "Zero Trust"],
    metrics: [
      { label: "Vulnerabilidades Internas", value: "0 Toleradas" },
      { label: "Assinatura Criptográfica", value: "Ed25519 / RSA" },
      { label: "Cobertura de Malha", value: "100% APIs" }
    ]
  },
  {
    id: "governance-dlp",
    title: "Plataforma de Auditoria, DLP & Custódia Corporativa",
    codename: "SENTINEL-DLP",
    category: "Security & Zero Trust",
    organization: "Banco Safra",
    period: "2026",
    summary: "Sistema corporativo de comunicação de gerentes financeiros com aplicação ativa de Data Loss Prevention (DLP), custódia e tráfego seguro de arquivos, além de delegação e substituição temporária de atendimento.",
    architectureHighlights: [
      "Inspeção e sanitização de tráfego de dados sensíveis em tempo real (DLP)",
      "Custódia criptografada e entrega auditável de anexos confidenciais",
      "Mecanismo de transferência e delegação de atendimento temporário sem quebra de compliance",
      "Dashboards analíticos de adoção e índices de conformidade regulatória"
    ],
    stack: ["TypeScript", "NestJS", "PostgreSQL", "Redis", "AWS S3 / KMS", "DLP Engine"],
    metrics: [
      { label: "Prevenção de Vazamento", value: "Ativa em Tempo Real" },
      { label: "Auditoria de Sessões", value: "Imutável" },
      { label: "Conformidade", value: "Bacen / LGPD" }
    ]
  },
  {
    id: "pix-ai-engine",
    title: "Motor Conversacional 100% IA para o PIX",
    codename: "NEXUS-PIX",
    category: "Financial Systems",
    organization: "Banco Safra",
    period: "2025 - 2026",
    summary: "Canal de atendimento e suporte transacional do PIX baseado integralmente em Inteligência Artificial, proporcionando autoatendimento autônomo com alta assertividade e resiliência em altíssima volumetria.",
    architectureHighlights: [
      "Processamento de Linguagem Natural (PNL) com reconhecimento afinado de intenções financeiras",
      "Resolução autônoma de dúvidas e fluxos operacionais sem escalonamento humano",
      "Alta disponibilidade e elasticidade sob eventos de pico e datas sazonais",
      "Integração segura com as camadas transacionais bancárias"
    ],
    stack: ["Python", "Node.js", "PNL / Intent Engines", "Microsserviços", "Redis", "Docker"],
    metrics: [
      { label: "Autonomia do Canal", value: "100% IA" },
      { label: "Resolução em Autoatendimento", value: "> 92%" },
      { label: "Promoção para Sênior", value: "Em 7 meses" }
    ]
  },
  {
    id: "edge-mcp-hub",
    title: "Model Context Protocol (MCP) & Local Vector Search",
    codename: "CHRONOS-EDGE",
    category: "Edge AI & Multi-Agent",
    organization: "Open Architecture",
    period: "2026",
    summary: "Arquitetura privacy-first no edge que executa modelos compactos e busca vetorial por similaridade semântica no próprio navegador via WebGPU / ONNX, com orquestração segura baseada no protocolo MCP.",
    architectureHighlights: [
      "Inferência local de embeddings vetoriais via WebGPU sem custo de API em nuvem",
      "Ferramental tipado (MCP Tools) com anotações de idempotência e aprovação",
      "Preservação absoluta de privacidade do visitante (Zero data leakage)",
      "Busca semântica em linguagem natural através dos dados do portfólio"
    ],
    stack: ["WebGPU", "Transformers.js v4", "ONNX Runtime Web", "MCP Protocol", "TypeScript"],
    metrics: [
      { label: "Privacidade", value: "100% On-Device" },
      { label: "Custo de API", value: "$0.00" },
      { label: "Latência de Busca", value: "Zero Cloud Trip" }
    ]
  }
];
