# CARTA DISRUPTIVA & SALVAGUARDA DE ENGENHARIA (OUTUBRO DE 2026)
> **Autoridade Canônica:** `docs/Design Web Portfólio Disruptivo IA.txt`  
> **Propósito:** Blindar o desenvolvimento contra regressão à mediocridade, padrões genéricos de LLMs e templates corporativos sem alma.

---

## 1. Princípio Fundamental de Veto (The Non-Generic Mandate)
Antes de escrever, aprovar ou sugerir qualquer componente, layout ou funcionalidade, o assistente **DEVE** aplicar o teste do "Fator WOW":
> *"Se este componente parecer um layout padrão de dashboard tradicional, um card estático do Tailwind UI, ou um template de portfólio comum dos anos 2020-2024, ele deve ser IMEDIATAMENTE REPROVADO e redesenhado."*

---

## 2. As Quatro Leis Inquebráveis do Projeto

### LEI I: Dark Glassmorphism 3.0 (Física Óptica e Materiais)
1. **Transdução Óptica Real:** Superfícies utilizam `backdrop-filter: blur(16px) saturate(150%)` com películas finas translúcidas (`rgba(255, 255, 255, 0.08)` a `0.15`).
2. **Bordas Capturadoras de Luz (Light Catchers):** Todos os painéis de vidro levam contorno semitransparente de 1px (`border: 1px solid rgba(255, 255, 255, 0.15)`).
3. **Limite de Profundidade:** **NUNCA** sobrepor mais de 3 camadas de vidro na mesma linha de visão para evitar degradação de GPU e perda de contraste.
4. **Fundo com Eixo Z Negativo:** Nunca usar preto sólido chapado (#000000). Usar gradientes cósmicos profundos com orbes de neon ambientais (*ambient light leaks* em tons de `#1856FF` e `#3A344E`) flutuando sob o vidro.
5. **Legibilidade Inegociável:** Nenhum texto de leitura corporativa repousa em vidro sem tratamento anti-ruído.

### LEI II: Engenharia Cinética & Antigravity UI (Física de Microgravidade)
1. **Espaço Dinâmico Zero-G:** Elementos centrais flutuam sob gravidade simulada suave (`gravity = -0.1` ou micro-oscilações em molas/spring physics).
2. **Repulsão e Interatividade Tátil:** Ao aproximar o cursor do mouse, os elementos e cartões respondem com vetores de repulsão suaves, atrito e profundidade.
3. **Isolamento de Threads:** O canvas físico pesado opera preferencialmente desacoplado da Main Thread (via `OffscreenCanvas` + Web Worker ou arquitetura instanciada WebGPU/Rapier.js), garantindo que o DOM e interações mantenham 60–120 FPS.
4. **Degradação Elegante:** WebGPU com transição fluida para WebGL quando a máquina cliente não tiver suporte habilitado.

### LEI III: Edge AI & Zero Trust Governance (Inteligência Real no Navegador)
1. **Zero Fake Demos:** Nada de colocar apenas "prints" de telas ou mockups inertes. O portfólio demonstra a senioridade de backend/IA do Thadeu através de sistemas vivos.
2. **Inferência no Edge:** Uso de Transformers.js / ONNX Runtime Web com quantização (WebGPU execution provider) para busca semântica instantânea por embeddings locais.
3. **Orquestração MCP (Model Context Protocol):** O ecossistema expõe ferramentas tipadas (readOnly, safe execution) demonstrando a maturidade corporativa do Thadeu em sistemas de missão crítica no setor financeiro.

### LEI IV: Modern Web Core (React 19 & Next.js 15)
1. **Nenhum Bloat Inútil:** Preferir Server Actions (`use server` e `useActionState`) para mutações progressivas em vez de dezenas de rotas sintéticas `/api/`.
2. **Cinemática Nativa de Roteamento:** Utilizar View Transitions API nativa (`<ViewTransition share="morph">` ou transições declarativas CSS) em substituição a bibliotecas pesadas de animação de páginas.
3. **Arquitetura como Código:** READMEs interativos, diagramas visuais (fluxogramas de mensageria, malhas Zero Trust, grafos de agentes) integrados na UI.

---

## 3. Checklist de Auditoria Contínua (Executar antes de cada entrega)
- [ ] O componente respeita os Design Tokens oficiais (`#1856FF`, `#3A344E`, `#07CA6B`, `#EA2143`)?
- [ ] A tipografia utiliza *Plus Jakarta Sans* para display/UI e *JetBrains Mono* para código e dados técnicos?
- [ ] Há física interativa ou sensação tátil viva (Antigravity)?
- [ ] A performance está preservada (GPU baking, sprite caching, memoização de shaders)?
- [ ] O conteúdo destaca a experiência sênior real do Thadeu (Banco Safra, Zero Trust M2M, Brokers de Mensageria, Agentes IA, PIX)?

Se houver **qualquer dúvida ou ambiguidade**, consulte imediatamente o documento-raiz:  
`docs/Design Web Portfólio Disruptivo IA.txt`.
