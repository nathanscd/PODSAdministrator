# Research/ETL API

API Express usada pelo frontend para pesquisa na web e enriquecimento de relatórios com GROQ.

## Estrutura

- `src/server.js` — servidor Express, endpoints e integração com DuckDuckGo/GROQ.
- `package.json` — pacote `podsadministrator-research-etl-api`.
- `render.yaml` — configuração de deploy no Render.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/api/research` | Endpoint canônico de pesquisa/enriquecimento |
| POST | `/api/claude` | Alias legado mantido para compatibilidade |

Body:

```json
{
  "prompt": "...",
  "system": "..."
}
```

## Configuração

```powershell
npm run api:research:install
```

No PowerShell:

```powershell
$env:GROQ_API_KEY = "..."
$env:PORT = "3001"
```

No frontend, configurar `VITE_ETL_API_URL`, por exemplo `http://localhost:3001` ou a URL pública do Render. Se ausente, o frontend usa `https://podsadministrator.onrender.com`.

`GROQ_API_KEY` é somente do servidor; nunca usar prefixo `VITE_` para este segredo.

## Executar

```powershell
npm run api:research:dev
npm run api:research:start
```

## Deploy

`apis/research-etl/render.yaml` define o serviço `podsadministrator-research-etl-api`, com `rootDir: apis/research-etl`, runtime Node e health check em `/health`.
