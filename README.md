# Thadeu Ramos — Portfólio de Engenharia e IA

Portfólio interativo que apresenta experiências em engenharia de plataformas, segurança e sistemas de IA. A interface combina Dark Glassmorphism, navegação por estágios, física local e demonstrações de IA executadas no navegador.

## Stack atual

- Next.js 16.4 / React 19.3 / TypeScript
- Tailwind CSS 4
- Three.js `WebGPURenderer` + TSL, Bloom e `OffscreenCanvas` em Web Worker; fallback WebGL2 na thread principal
- Rapier/WASM em worker para física e interação do Atlas
- Transformers.js 4 / ONNX Runtime Web para embeddings, geração local e ASR opcional
- MCP Streamable HTTP em `/api/mcp`, com schemas tipados, verificação do manifesto e consentimento explícito para contato

## Executar localmente

Requer Node.js compatível com as versões instaladas no projeto e npm.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para gerar uma compilação de produção:

```bash
npm run build
npm run start
```

O portfólio possui seis estágios navegáveis (Core, Sistemas, Resiliência, Segurança, Agente Edge e Dossiê). Os atalhos 1–6 mudam de estágio quando o foco não está em um campo editável.

## IA e privacidade

- Embeddings, geração Qwen e reconhecimento de fala são opt-in; pesos grandes não são baixados automaticamente ao abrir a página.
- A transcrição exige ativação explícita e permissão do microfone. O texto resultante pode ser revisto antes do envio.
- O cliente MCP consulta somente o conteúdo público e estático deste portfólio; não acessa sistemas ou telemetria corporativos.
- O pedido de contato exige aceitação explícita. Em desenvolvimento, sem `CONTACT_WEBHOOK_URL`, a Server Action grava os pedidos aceitos em `.data/recruiter-signals.jsonl`. Em produção, configure um destino de webhook seguro no ambiente do servidor e defina retenção e proteção contra abuso adequadas nesse destino.
- Não há sandbox ligada a endpoints internos, nem métricas de produção ou desempenho de GPU alegadas como prova independente.

## Deploy

A aplicação não é export estático: utiliza Server Actions e a rota MCP `/api/mcp`. Publique em um runtime Node compatível com Next.js e preserve essas rotas. Configure `CONTACT_WEBHOOK_URL` como variável secreta no provedor, nunca no cliente. O repositório inclui uma preparação de Compose para o servidor `barbudas` em `docs/deploy-barbudas.md`; ela ainda não foi iniciada nem exposta por domínio público.

## Validação

`npm run lint` verifica regras estáticas; `npm run build` valida a compilação de produção. Recursos dependentes do dispositivo — WebGPU/WebGL2, downloads de modelos, microfone, toque, transições e FPS — ainda precisam de validação manual no navegador e hardware de destino. Esta documentação não afirma uma taxa de quadros ou compatibilidade que não tenha sido medida.
