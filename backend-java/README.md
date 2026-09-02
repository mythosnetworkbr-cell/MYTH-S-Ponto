# MYTHØS Ponto — API

Backend Spring Boot 3 para o aplicativo MYTHØS Ponto.

## Requisitos
- Java 17+
- Maven 3.9+

## Executar

```bash
cd backend-java
mvn spring-boot:run
```

A API sobe em `http://localhost:8080` (ou na porta definida por `PORT`).

## Endpoints

- `POST /api/ponto/toggle?userId=1` — abre/fecha o ponto.
- `GET /api/ponto/historico?userId=1` — histórico do usuário.
- `POST /api/justificativas?userId=1&date=2026-09-02&reason=...` — registra justificativa.
- `GET /api/relatorios` — relatórios.
- `GET /api/avisos` — avisos.
- `GET /api/chat` — últimas 100 mensagens.
- `POST /api/chat?userId=1&content=...` — envia mensagem.
- `GET /api/novidades` — novidades.
- `POST /api/novidades?authorId=1&title=...&message=...` — publica novidade.
- `GET /api/usuarios` — usuários.

## Banco

O desenvolvimento usa H2 persistente em arquivo (`./data/mythosponto`). O e-mail do usuário Owner inicial pode ser definido por `MYTHOS_OWNER_EMAIL`. Para produção, substitua H2 por PostgreSQL e adicione autenticação/autorização.
