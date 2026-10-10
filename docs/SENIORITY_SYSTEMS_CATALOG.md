# CATÁLOGO DE SISTEMAS DE ALTA SENIORIDADE (THADEU RAMOS)
> Este documento ancora os projetos e estudos de caso reais que compõem o portfólio.
> **Regra:** NUNCA substituir estes sistemas reais por exemplos genéricos (como "Todo App", "Dashboard de Vendas", "Clone do Uber").

---

### SISTEMA 01: Broker de Mensageria Agnóstico para IA
- **Organização:** Banco Safra (Setor Financeiro)
- **Papel:** Concepção Técnica, Arquitetura e Implementação
- **Problema Resolvido:** Múltiplos canais de entrada (WhatsApp Business Platform/Meta Cloud API, Telegram, integrações corporativas internas) precisavam ser roteados com latência ultrabaixa para múltiplos modelos de Inteligência Artificial sem acoplamento direto de canal.
- **Destaques Arquiteturais:**
  - Broker agnóstico desacoplado com buffers de alta disponibilidade.
  - Implementação de Webhooks resilientes e conformidade com COEX (Meta).
  - Camada de *tools* dinâmicas para agentes (listas, botões, validação de biometria facial, callbacks assíncronos).
  - Roteamento em tempo real direto para o ecossistema de modelos de IA.
- **Manifestação Visual no Portfólio:**
  - Diagrama de topologia reativo (Entrada multicanal → Buffer agnóstico → Dispatcher MCP → LLMs).
  - Simulador interativo de payload com inspeção de métricas de latência.

---

### SISTEMA 02: Malha Zero Trust & Autenticação M2M Criptográfica
- **Organização:** Banco Safra
- **Papel:** Líder de Auditoria e Hardening de Segurança
- **Problema Resolvido:** Eliminar vulnerabilidades e exposições internas na malha de microsserviços corporativos bancários.
- **Destaques Arquiteturais:**
  - Autenticação Máquina-a-Máquina (M2M) utilizando tokens criptográficos assinados por aplicação (rastreabilidade e não-repúdio ponta a ponta).
  - Controle de Acesso Baseado em Papéis (RBAC) com integração nativa aos grupos do Active Directory (AD).
  - Comunicação segura com mTLS e eliminação de credenciais estáticas compartilhadas.
- **Manifestação Visual no Portfólio:**
  - Inspetor visual de grafo de confiança Zero Trust.
  - Demonstração do ciclo de vida de handshake M2M com validação de assinatura e verificação RBAC.

---

### SISTEMA 03: Plataforma de Governança, DLP & Custódia Corporativa
- **Organização:** Banco Safra
- **Papel:** Engenharia e Sustentação do Sistema Corporativo de Gerentes
- **Problema Resolvido:** Comunicação segura e auditável entre gerentes e clientes com conformidade estrita de dados bancários.
- **Destaques Arquiteturais:**
  - Políticas ativas de Data Loss Prevention (DLP) em tempo real para prevenção de vazamento de dados sensíveis.
  - Custódia, validação e tráfego seguro de arquivos confidenciais.
  - Mecanismos de delegação e substituição temporária transparente de atendimento.
  - Painéis de telemetria de conformidade e adoção em escala.
- **Manifestação Visual no Portfólio:**
  - Console analítico Dark Glassmorphism com logs de auditoria e filtros DLP simulados.

---

### SISTEMA 04: Motor Conversacional 100% IA para o PIX
- **Organização:** Banco Safra
- **Papel:** Responsável Técnico de Concepção, Integração e Sustentação
- **Problema Resolvido:** Atendimento autônomo de alta criticidade e volumetria transacional para operações de PIX sem fricção.
- **Destaques Arquiteturais:**
  - Reconhecimento de intenções e extração de entidades em tempo real via PNL.
  - Resiliência operacional sob picos transacionais com microsserviços escaláveis.
  - Autoatendimento seguro com taxa mínima de falha de compreensão.
- **Manifestação Visual no Portfólio:**
  - Simulador de fluxo transacional de diálogo e árvore de decisão do motor conversacional.

---

### SISTEMA 05: Model Context Protocol (MCP) Edge Hub & Local Vector Search
- **Organização:** Open-Source / Portfólio Core
- **Papel:** Criador e Engenheiro de Sistemas
- **Problema Resolvido:** Navegação inteligente, privada e local no portfólio usando LLMs compactos e busca por similaridade de embeddings (Transformers.js / ONNX) sem envio de dados a servidores de terceiros.
- **Destaques Arquiteturais:**
  - Execução de embeddings locais com quantização (WebGPU).
  - Registro de ferramentas MCP tipadas com anotações de idempotência e segurança.
