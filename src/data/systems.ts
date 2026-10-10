export interface ExecutionStage {
  step: string;
  title: string;
  description: string;
  tech: string;
  badgeColor: string;
  actionOutput: string;
}

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
  executionFlow: ExecutionStage[];
  failureHandling: string;
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
    ],
    executionFlow: [
      {
        step: "INGRESS",
        title: "Recepção Multicanal Desacoplada",
        description: "Ingestão via Meta Cloud Webhook (WhatsApp COEX) e Telegram sem travar conexão do cliente.",
        tech: "HTTP/2 Webhooks & API Gateway",
        badgeColor: "bg-[#1856FF]/20 text-[#38BDF8] border-[#1856FF]/40",
        actionOutput: "Payload normalizado para schema neutro JSON em 3.2ms"
      },
      {
        step: "BUFFER",
        title: "Agnostic Queue & De-duplication",
        description: "Buffer em memória distribuído para amortecer rajadas e prevenir perda de mensagens duplicadas.",
        tech: "Redis In-Memory Ring Buffer",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        actionOutput: "Idempotency key validada e isolamento em fila agnóstica"
      },
      {
        step: "DISPATCH",
        title: "Roteamento Dinâmico para Modelos de IA",
        description: "Distribuição da conversa para LLMs bancários com injeção de tools (biometria facial, listas interativas).",
        tech: "Worker Pool com Circuit Breaker",
        badgeColor: "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40",
        actionOutput: "Disparo assíncrono para IA com callback resiliente em 42ms"
      }
    ],
    failureHandling: "Circuit Breaker isola falhas de terceiros (Meta/Telegram) e retém payloads em DLQ sem derrubar a IA."
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
    ],
    executionFlow: [
      {
        step: "HANDSHAKE",
        title: "Túnel Seguro Bidirecional (mTLS)",
        description: "Validação mútua de certificados x509 entre os microsserviços requisitante e respondedor.",
        tech: "Mutual TLS com Rotação de Certificados",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        actionOutput: "Conexão cifrada estabelecida sem credenciais estáticas"
      },
      {
        step: "CRYPTO VERIFY",
        title: "Assinatura Assimétrica de Aplicação",
        description: "Checagem do token M2M assinado com chave privada Ed25519 individual da aplicação de origem.",
        tech: "Ed25519 Asymmetric Verification",
        badgeColor: "bg-[#1856FF]/20 text-[#38BDF8] border-[#1856FF]/40",
        actionOutput: "Autenticidade e não-repúdio confirmados em 1.1ms"
      },
      {
        step: "RBAC LOOKUP",
        title: "Autorização via Grupos do Active Directory",
        description: "Consulta em tempo real de privilégios de escopo contra as permissões corporativas do AD.",
        tech: "Active Directory LDAP / Token Claims",
        badgeColor: "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40",
        actionOutput: "Permissão concedida para escopo 'finance:transact:read'"
      }
    ],
    failureHandling: "Qualquer requisição sem assinatura válida é abortada no gateway perimetral antes de atingir o banco de dados."
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
    ],
    executionFlow: [
      {
        step: "TRAFFIC SNIFF",
        title: "Interceptação Heurística de Pacotes",
        description: "Varredura contínua de streams de mensagens e anexos em busca de padrões sensíveis (CPF, CNPJ, contas bancárias).",
        tech: "Regex Compilado & Heurística DLP",
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
        actionOutput: "Varredura de payload concluída: 0 falsos positivos"
      },
      {
        step: "SANITIZATION",
        title: "Mascaramento & Ofuscação Instantânea",
        description: "Transformação de dados confidenciais em tokens seguros antes de qualquer persistência em logs ou exibição ao cliente.",
        tech: "Dynamic Data Masking Engine",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        actionOutput: "Dados pessoais confidenciais substituídos por hash auditável"
      },
      {
        step: "CUSTODY LOG",
        title: "Custódia Criptografada Imutável",
        description: "Gravação de comprovante de auditoria em armazenamento cifrado com carimbo de tempo seguro (Bacen 4.893).",
        tech: "AWS KMS + PostgreSQL Audit Tables",
        badgeColor: "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40",
        actionOutput: "Hash de custódia gerado e indexado para auditoria regulatória"
      }
    ],
    failureHandling: "Tentativas de envio de anexos não assinados sofrem quarentena automática imediata com alerta para compliance."
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
    ],
    executionFlow: [
      {
        step: "INTENT RECOG",
        title: "Extração de Intenções e Entidades",
        description: "Classificação em tempo real da intenção do cliente (ex: chave PIX, estorno, comprovante, limite operacional).",
        tech: "PNL Custom Finetuned Classifier",
        badgeColor: "bg-[#1856FF]/20 text-[#38BDF8] border-[#1856FF]/40",
        actionOutput: "Intenção identificada: 'pix_query_status' (Confiança: 98.4%)"
      },
      {
        step: "TRANSACT SYNC",
        title: "Consulta Concorrente ao Barramento Bancário",
        description: "Consulta segura de saldo e extrato transacional através de microsserviços de alta resiliência sob concorrência.",
        tech: "gRPC Streaming & Cache Redis",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        actionOutput: "Status de liquidação recuperado do SPI (Bacen) em 18ms"
      },
      {
        step: "SYNTHESIS",
        title: "Síntese Conversacional Contextual",
        description: "Geração de resposta humanizada e objetiva com botões de ação e extrato instantâneo para o cliente.",
        tech: "Template Engine Seguro com Fallback Determinístico",
        badgeColor: "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40",
        actionOutput: "Autoatendimento concluído sem transbordo humano"
      }
    ],
    failureHandling: "Se a ambiguidade da mensagem ultrapassar o threshold de segurança, aciona fallback determinístico seguro."
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
    ],
    executionFlow: [
      {
        step: "LOCAL EMBED",
        title: "Vetorização On-Device no Navegador",
        description: "A pergunta do usuário é convertida em vetor multidimensional usando WebGPU diretamente na GPU do cliente.",
        tech: "Transformers.js v4 + ONNX WebGPU",
        badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        actionOutput: "Vetor de 384 dimensões gerado localmente em 8.4ms"
      },
      {
        step: "COSINE SIM",
        title: "Busca Vetorial Semântica em Memória",
        description: "Cálculo de similaridade por cosseno contra a matriz indexada de competências e histórico de engenharia.",
        tech: "WASM Vector Search Array Buffer",
        badgeColor: "bg-[#1856FF]/20 text-[#38BDF8] border-[#1856FF]/40",
        actionOutput: "Top matches rankeados com similaridade > 0.89"
      },
      {
        step: "MCP TOOL EXEC",
        title: "Invocação Controlada de Ferramenta",
        description: "O modelo aciona a ferramenta tipada de visualização de arquitetura com garantia de idempotência e segurança.",
        tech: "Model Context Protocol (MCP Spec)",
        badgeColor: "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40",
        actionOutput: "Ferramenta executada localmente sem telemetria externa"
      }
    ],
    failureHandling: "Degradação graciosa automática para WebAssembly CPU caso o dispositivo do visitante não suporte WebGPU."
  }
];
