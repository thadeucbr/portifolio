# MANIFESTO ARQUITETURAL VIVO (OUTUBRO DE 2026)
> Base canônica detalhada extraída de `docs/Design Web Portfólio Disruptivo IA.txt`

## 1. Visão Sistêmica
O objetivo deste projeto não é criar uma página web convencional, mas uma **instalação digital de alta engenharia** para Thadeu Castelo Branco Ramos. O portfólio atesta senioridade pela convergência de três domínios críticos:
1. **Computação Gráfica e Física em Tempo Real (WebGL / WebGPU / Rapier.js).**
2. **Engenharia de Plataforma de Missão Crítica (Mensageria, Zero Trust, M2M, Resiliência).**
3. **IA Generativa Nativa no Edge (Transformers.js, ONNX Runtime Web, MCP).**

---

## 2. Parâmetros do Dark Glassmorphism 3.0
- **Fórmula de Desfoque Óptico:**
  ```css
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  background: rgba(255, 255, 255, 0.08); /* ou 0.05 a 0.12 dependendo da profundidade */
  border: 1px solid rgba(255, 255, 255, 0.15); /* Light catcher */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  ```
- **Camadas Restritas:** No máximo 3 planos translúcidos sobrepostos.
- **Backdrop Cósmico:** Fundo composto por iluminação neon volumétrica flutuando no eixo Z negativo (`#1856FF` e tons violeta/ameixa `#3A344E`).

---

## 3. Especificação Antigravity UI & Canvas Desacoplado
- **Microgravidade:** Gravidade constante suave (`-0.1`).
- **Spring Physics:** Amortecimento e inércia orgânica em todos os reposicionamentos.
- **Interação de Cursor (Repulsion Field):** O mouse emite um campo radial de repulsão que deforma levemente a posição dos elementos ao redor com atrito simulado.
- **Isolamento de Threads:** Web Workers operando `OffscreenCanvas` para que reconciliações de estado do React não interfiram na taxa de quadros (60-120 FPS).
- **Fallback WebGL:** Sempre prover inicialização graciosa caso a máquina do usuário não possua flags de WebGPU ativadas.

---

## 4. Edge AI & Model Context Protocol (MCP)
- **Motor:** Transformers.js v4 + ONNX Runtime Web.
- **Busca Semântica:** Indexação de embeddings locais dos projetos e competências do Thadeu. Permite busca em linguagem natural com latência zero e privacidade total.
- **MCP Client Integrado:** O agente do portfólio expõe ferramentas com tipagem estrita:
  - `queryCareerSystem(query: string)`: busca projetos por impacto arquitetural.
  - `inspectArchitecture(systemId: string)`: abre o diagrama de topologia e fluxo de dados.
  - `requestContactTransmission(payload)`: validação com ação segura via Server Action.

---

## 5. Web Core (Next.js 15 & React 19)
- **Server Components (RSC):** Renderização inicial hiper-rápida, sem carregar bibliotecas desnecessárias no cliente.
- **Server Actions:** Formulários de contato e feedback sem rotas `/api/` dispersas, com mutação progressiva (`useActionState`).
- **View Transitions API:** Animações nativas entre abas e modais (`<ViewTransition>`).
