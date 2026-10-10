# Preparar deploy no barbudas

A aplicação usa Server Actions e `/api/mcp`; não é um export estático. O Compose publica o Next.js na LAN em `192.168.1.239:3000` e não altera Cosmos/Cloudflare, roteador ou regras de firewall.

## Arquivos

- `Dockerfile`: build multi-stage, runtime Next standalone e usuário não-root.
- `compose.yml`: imagem tagueada, restart policy, healthcheck, limites de logs e capabilities removidas.
- `.env.example`: valores não secretos para bind e tag. O `.env` real é ignorado pelo Git.

## Publicação (quando autorizada)

1. Clonar `main` em `/home/thadeu/services/portifolio`.
2. Copiar `.env.example` para `.env`, trocar `PORTFOLIO_IMAGE_TAG` pelo SHA curto do commit (`git rev-parse --short=12 HEAD`) e conferir IP/porta. Aplicar `chmod 600 .env`.
3. Se houver um destino de webhook de contato, inserir `CONTACT_WEBHOOK_URL` diretamente no `.env` do servidor; não enviar o valor pelo chat. Sem webhook, o site sobe, mas a ação de contato falha fechada em produção.
4. Validar: `docker compose config --quiet`.
5. Construir a imagem: `docker compose build web`.
6. Só após confirmar a publicação: `docker compose up -d web`.
7. Verificar `docker compose ps`, `docker compose logs --tail=100 web`, healthcheck e resposta HTTP em `http://192.168.1.239:3000/` a partir de um cliente da LAN.

O Compose não foi iniciado e nenhuma rota pública foi criada nesta preparação. Cosmos já usa a rede `host` e escuta em 80/443; se quiser um domínio com TLS, configurar depois uma rota Cosmos apontando para o serviço LAN, sem abrir portas no roteador por padrão.

Embeddings, ASR e geração Qwen continuam opt-in e são executados no navegador do visitante; os pesos não são parte da imagem do servidor.
