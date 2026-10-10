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
  sourceLabel: string;
  category: "Platform Architecture" | "Security & Zero Trust" | "Edge AI & Multi-Agent" | "Financial Systems";
  organization: string;
  period: string;
  summary: string;
  architectureHighlights: string[];
  stack: string[];
  facts: { label: string; value: string }[];
  executionFlow: ExecutionStage[];
  failureHandling: string;
}

const CURRICULUM_NOTE = "Resumo baseado no CV; não descreve topologia interna, métricas operacionais ou dados de produção.";
const stage = (step: string, title: string, description: string, tech: string, badgeColor: string): ExecutionStage => ({
  step, title, description, tech, badgeColor, actionOutput: CURRICULUM_NOTE,
});
const blue = "bg-[#1856FF]/20 text-[#38BDF8] border-[#1856FF]/40";
const purple = "bg-purple-500/20 text-purple-300 border-purple-500/40";
const green = "bg-[#07CA6B]/20 text-[#07CA6B] border-[#07CA6B]/40";
const internalLabel = "EXPERIÊNCIA INTERNA · RESUMO DO CV";
const internalOrg = "Banco Safra · experiência interna";

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
    portfolio: "https://thadeucbr.github.io",
  },
  summary: "Engenheiro de Software Sênior com experiência em mensageria distribuída, segurança corporativa e integração de IA no setor financeiro.",
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "C2 Proficient (EF SET 75/100)" },
  ],
  education: [
    { degree: "Pós-Graduação em Inteligência Artificial e Aprendizado de Máquina", institution: "PUC Minas", year: "2026" },
    { degree: "Tecnologia em Análise e Desenvolvimento de Sistemas", institution: "Descomplica Faculdade Digital", year: "2024" },
  ],
};

export const SYSTEMS_DATA: SystemProject[] = [
  {
    id: "ai-messaging-broker",
    title: "Broker de Mensageria Agnóstico para IA",
    sourceLabel: internalLabel,
    category: "Platform Architecture",
    organization: internalOrg,
    period: "Experiência Sênior · desde mai. 2026",
    summary: "Concepção e implementação de uma plataforma para receber mensagens de WhatsApp, Telegram e integrações corporativas e roteá-las ao ecossistema de IA do banco, com desacoplamento, baixa latência e resiliência.",
    architectureHighlights: [
      "Recepção de fluxos de múltiplos canais e integrações corporativas.",
      "Roteamento em tempo real ao ecossistema de modelos de IA do banco.",
      "Integrações Meta Cloud API, Webhooks e implantação de COEX.",
      "Ferramentas para agentes com listas, botões, validação de biometria facial e callbacks assíncronos.",
    ],
    stack: ["Meta Cloud API", "WhatsApp", "Telegram", "Webhooks", "COEX"],
    facts: [
      { label: "Canais", value: "WhatsApp · Telegram · corporativos" },
      { label: "Objetivo", value: "Roteamento para IA" },
      { label: "Atributos", value: "Baixa latência · resiliência" },
    ],
    executionFlow: [
      stage("CANAIS", "Entradas multicanal", "Mensagens de WhatsApp, Telegram e integrações corporativas.", "Canais de comunicação", blue),
      stage("ROTEAMENTO", "Integração com IA", "Roteamento em tempo real ao ecossistema de modelos de IA do banco.", "Mensageria · IA", purple),
      stage("FERRAMENTAS", "Interações conversacionais", "Listas, botões, validação de biometria facial e callbacks assíncronos.", "Ferramentas para agentes", green),
    ],
    failureHandling: CURRICULUM_NOTE,
  },
  {
    id: "zero-trust-mesh",
    title: "Hardening de APIs e Arquitetura Zero Trust",
    sourceLabel: internalLabel,
    category: "Security & Zero Trust",
    organization: internalOrg,
    period: "Experiência Sênior · desde mai. 2026",
    summary: "Auditoria e hardening de segurança na malha de microsserviços da área, com autenticação M2M por tokens criptográficos assinados por aplicação e RBAC integrado aos grupos do Active Directory.",
    architectureHighlights: [
      "Auditoria e endurecimento da segurança de microsserviços.",
      "Autenticação máquina-a-máquina com tokens criptográficos assinados por aplicação.",
      "Rastreabilidade ponta a ponta das chamadas.",
      "RBAC integrado aos grupos do Active Directory.",
    ],
    stack: ["M2M", "Tokens criptográficos assinados", "RBAC", "Active Directory"],
    facts: [
      { label: "Autenticação", value: "M2M · tokens assinados" },
      { label: "Autorização", value: "RBAC · Active Directory" },
      { label: "Escopo descrito", value: "Microsserviços da área" },
    ],
    executionFlow: [
      stage("AUDITORIA", "Revisão de segurança", "Auditoria e hardening da malha de microsserviços da área.", "Segurança de APIs", purple),
      stage("AUTENTICAÇÃO", "Identidade M2M", "Tokens criptográficos assinados individualmente por aplicação.", "M2M · assinatura", blue),
      stage("AUTORIZAÇÃO", "Controle de acesso", "RBAC integrado aos grupos do Active Directory, com rastreabilidade ponta a ponta.", "RBAC · Active Directory", green),
    ],
    failureHandling: CURRICULUM_NOTE,
  },
  {
    id: "governance-dlp",
    title: "Auditoria, DLP e Governança de Comunicação",
    sourceLabel: internalLabel,
    category: "Security & Zero Trust",
    organization: internalOrg,
    period: "Experiência Sênior · desde mai. 2026",
    summary: "Desenvolvimento e sustentação de um sistema corporativo de comunicação de gerentes, com políticas DLP, custódia e tráfego seguro de arquivos, delegação temporária de atendimento e painéis de adoção e conformidade.",
    architectureHighlights: [
      "Políticas de Data Loss Prevention (DLP) em comunicação corporativa.",
      "Custódia e tráfego seguro de arquivos.",
      "Delegação e substituição temporária de atendimento.",
      "Painéis analíticos de adoção e conformidade.",
    ],
    stack: ["DLP", "Custódia de arquivos", "Delegação", "Painéis analíticos"],
    facts: [
      { label: "Governança", value: "DLP · auditoria" },
      { label: "Arquivos", value: "Custódia · tráfego seguro" },
      { label: "Operação", value: "Delegação · conformidade" },
    ],
    executionFlow: [
      stage("GOVERNANÇA", "Comunicação corporativa", "Sistema corporativo de comunicação de gerentes.", "Comunicação", blue),
      stage("DLP", "Proteção e custódia", "Políticas DLP e custódia/tráfego seguro de arquivos.", "DLP · arquivos", purple),
      stage("OPERAÇÃO", "Atendimento e conformidade", "Delegação temporária e painéis de adoção e conformidade.", "Delegação · analytics", green),
    ],
    failureHandling: CURRICULUM_NOTE,
  },
  {
    id: "pix-ai-engine",
    title: "Canal de Atendimento do PIX baseado em IA",
    sourceLabel: internalLabel,
    category: "Financial Systems",
    organization: internalOrg,
    period: "Experiência Pleno · nov. 2025–mai. 2026",
    summary: "Responsabilidade técnica pela concepção, integração e sustentação de um canal de atendimento do PIX baseado integralmente em IA; trabalho também incluiu refinamento do reconhecimento de intenções e entidades para interações sob alta demanda.",
    architectureHighlights: [
      "Canal de atendimento e autoatendimento do PIX baseado integralmente em IA.",
      "Refinamento de modelos de reconhecimento de intenções e entidades.",
      "Trabalho voltado a interações escaláveis sob alta demanda transacional.",
      "Promoção de Engenheiro Pleno a Sênior após sete meses.",
    ],
    stack: ["Inteligência Artificial", "PNL", "Reconhecimento de intenções", "Reconhecimento de entidades"],
    facts: [
      { label: "Canal", value: "100% IA" },
      { label: "PNL", value: "Intenções · entidades" },
      { label: "Progressão", value: "Promoção em 7 meses" },
    ],
    executionFlow: [
      stage("CANAL", "Atendimento PIX", "Concepção, integração e sustentação de canal de atendimento integralmente baseado em IA.", "PIX · Inteligência Artificial", blue),
      stage("PNL", "Intenções e entidades", "Refinamento de modelos para reduzir falhas de compreensão e melhorar as interações.", "PNL", purple),
      stage("ESCALA", "Alta demanda", "Solução descrita no CV como escalável sob alta demanda transacional.", "Escalabilidade", green),
    ],
    failureHandling: "O CV descreve o escopo e os objetivos; não contém métricas de assertividade, disponibilidade ou volume para publicar.",
  },
  {
    id: "edge-mcp-hub",
    title: "Busca Semântica Local e MCP do Portfólio",
    sourceLabel: "DEMONSTRAÇÃO TÉCNICA DO PORTFÓLIO",
    category: "Edge AI & Multi-Agent",
    organization: "Projeto demonstrativo independente · não é projeto Safra",
    period: "Implementação demonstrativa · 2026",
    summary: "Demonstração deste próprio portfólio: busca semântica local, geração local opcional ainda sem validação end-to-end e servidor MCP para consultar fichas estáticas. O contato é enviado ao servidor apenas após consentimento explícito.",
    architectureHighlights: [
      "Busca semântica local com fallback lexical identificado.",
      "Geração local opcional, sem alegar validação de inferência real no navegador.",
      "Servidor MCP same-origin para listar e consultar o conteúdo estático do portfólio.",
      "Fluxo de contato separado, condicionado a consentimento explícito.",
    ],
    stack: ["TypeScript", "Transformers.js", "ONNX", "WebGPU/WASM", "MCP"],
    facts: [
      { label: "Natureza", value: "Demonstração do portfólio" },
      { label: "Busca", value: "Semântica local" },
      { label: "MCP", value: "Fichas estáticas" },
    ],
    executionFlow: [
      stage("BUSCA", "Busca semântica", "O mecanismo de busca local recupera conteúdo do perfil e das fichas de projeto.", "Embeddings locais", blue),
      stage("CONSULTA", "Ferramentas MCP", "O endpoint MCP lista projetos ou retorna o detalhe estático de uma ficha.", "MCP · conteúdo estático", purple),
      stage("CONTATO", "Consentimento explícito", "A elicitation pede autorização antes de enviar dados de contato ao servidor.", "MCP Elicitation", green),
    ],
    failureHandling: "Esta demonstração pertence ao portfólio e não representa sistemas, dados ou endpoints internos do Banco Safra.",
  },
];
