# DESIGN SYSTEM & DESIGN TOKENS (DARK GLASSMORPHISM 3.0)
> Fonte canônica: `docs/Design Web Portfólio Disruptivo IA.txt`

## 1. Tokens Semânticos de Cores

| Token Semântico | Hex / RGBA | Lógica e Aplicação |
|---|---|---|
| `--color-primary` | `#1856FF` | Electric Blue. Ações primárias, links ativos, destaques e lasers ópticos. |
| `--color-secondary` | `#3A344E` | Deep Plum. Painéis secundários, contrastes de sombra e ambient light leaks. |
| `--color-surface-glass-low` | `rgba(255, 255, 255, 0.08)` | Superfície de vidro mais translúcida (painéis de fundo), respeitando o mínimo do brief. |
| `--color-surface-glass-mid` | `rgba(255, 255, 255, 0.08)` | Superfície padrão de cards e gavetas. |
| `--color-surface-glass-high`| `rgba(255, 255, 255, 0.14)` | Superfície interativa em hover / modais ativos. |
| `--color-glass-border` | `rgba(255, 255, 255, 0.15)` | **Light catcher** mandatório de 1px em todos os painéis de vidro. |
| `--color-glass-border-focus`| `rgba(24, 86, 255, 0.45)` | Light catcher ativo em foco ou hover do cursor. |
| `--color-success` | `#07CA6B` | Status de agentes online, nós saudáveis, integridade de tokens. |
| `--color-danger` | `#EA2143` | Alertas críticos, bloqueios DLP, falhas de autenticação. |
| `--color-background-deep` | `#07090E` | Fundo abissal com ligeiro matiz azulado (nunca #000000 puro). |
| `--color-text-main` | `#FFFFFF` | Texto de alta prioridade com máximo contraste no modo escuro. |
| `--color-text-muted` | `#94A3B8` | Subtítulos e metadados secundários. |
| `--color-text-accent` | `#38BDF8` | Destaques ciano para telemetria e identificadores. |

---

## 2. Tipografia

- **Fonte Principal & Display:** `Plus Jakarta Sans`
  - Utilizada em títulos, menus, botões e cartões para clareza geométrica superior contra vidros foscos.
- **Fonte Técnica & Monospace:** `JetBrains Mono`
  - Utilizada estritamente em código, terminais de telemetria, timestamps, identificadores de nós e hashes criptográficos.

---

## 3. Classes Utilitárias do Vidro (Tailwind & CSS)

```css
/* Dark Glassmorphism 3.0 Standard */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}

.glass-panel-interactive {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-panel-interactive:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(24, 86, 255, 0.5);
  box-shadow: 0 12px 40px 0 rgba(24, 86, 255, 0.2);
  transform: translateY(-2px);
}
```

---

## 4. Diretrizes de Ergonomia Visual e Performance
1. **Regra das 3 Camadas:** Nunca empilhar mais de 3 painéis com `backdrop-filter` simultâneos.
2. **Anti-Ruído em Tipografia:** Textos em parágrafo (`p`, `article`) devem sempre possuir fundo semitransparente estabilizado ou contraste mínimo de 7:1 (WCAG AAA).
3. **Hardware Acceleration:** Usar `transform: translateZ(0)` e `will-change: transform` somente em entidades dinâmicas ativas para evitar sobrecarga de GPU.
