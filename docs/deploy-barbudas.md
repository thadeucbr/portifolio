# Preparar deploy no barbudas

A aplicação usa Server Actions e `/api/mcp`; não é um export estático. O Compose publica o Next.js na LAN em `192.168.1.239:3000` e não altera Cosmos/Cloudflare, roteador ou regras de firewall.

## Arquivos

- `Dockerfile`: build multi-stage, runtime Next standalone e usuário não-root.
- `compose.yml`: imagem tagueada, restart policy, healthcheck, limites de logs e capabilities removidas.
- `.env.example`: valores não secretos para bind e tag. O `.env` real é ignorado pelo Git.

## Publicação (quando autorizada)

1. Clonar `main` em `/home/thadeu/services/portifolio`.
2. Copiar `.env.example` para `.env`, trocar `PORTFOLIO_IMAGE_TAG` pelo SHA curto do commit (`git rev-parse --short=12 HEAD`) e conferir IP/porta. Aplicar `chmod 600 .env`.
3. Criar um bot com `@BotFather`; abrir uma conversa privada com ele e enviar `/start`.
4. Criar `secrets/telegram_bot_token` com permissão `600` e inserir o token diretamente nesse arquivo no servidor. Nunca colocá-lo em Git, no `.env`, nem no chat. O container roda como UID 1000, igual ao usuário `thadeu`, para ler o Docker secret local.
5. Executar `node scripts/telegram-chat-id.mjs`; o helper lê o token do arquivo e imprime somente IDs/tipos de chat, sem conteúdo das mensagens. Copiar o chat ID escolhido para `TELEGRAM_CHAT_ID` no `.env` (modo `600`).
6. Validar: `docker compose config --quiet`.
7. Construir a imagem: `docker compose build web`.
8. Só após confirmar a publicação: `docker compose up -d web`.
9. Verificar `docker compose ps`, `docker compose logs --tail=100 web`, healthcheck e resposta HTTP em `http://192.168.1.239:3000/` a partir de um cliente da LAN. Um envio de contato aceito deve gerar um aviso Telegram contendo nome, e-mail, empresa, motivo e recibo.

O Compose não foi iniciado e nenhuma rota pública foi criada nesta preparação. Cosmos já usa a rede `host` e escuta em 80/443; se quiser um domínio com TLS, configurar depois uma rota Cosmos apontando para o serviço LAN, sem abrir portas no roteador por padrão.

Embeddings, ASR e geração Qwen continuam opt-in e são executados no navegador do visitante; os pesos não são parte da imagem do servidor.
