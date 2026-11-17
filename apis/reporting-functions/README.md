# Reporting Functions

Cloud Functions do Firebase para geração de relatórios/PDF do PODSAdministrator.

## Estrutura

- `index.js` — função HTTPS `generateReportPDF`.
- `package.json` — dependências `firebase-admin`, `firebase-functions` e `puppeteer-core`.

A raiz do Firebase está configurada em `firebase.json`:

```json
{
  "functions": {
    "source": "apis/reporting-functions"
  }
}
```

## Função

`generateReportPDF` recebe:

```json
{
  "htmlContent": "...",
  "title": "Atlas Report"
}
```

Atualmente a implementação valida `htmlContent` e responde com um buffer PDF placeholder. A renderização HTML real deve ser implementada nesta função sem mover o código de volta para `firebase/functions`.

## Configuração e execução

```powershell
npm run api:reporting:install
npm run api:reporting:serve
npm run api:reporting:deploy
```

Para deploy direto da pasta:

```powershell
cd apis\reporting-functions
npm run deploy
```

O service account do Firebase Admin é lido pelo ambiente do Firebase/Google Application Default Credentials; não versionar arquivos `*firebase-adminsdk*.json`.
