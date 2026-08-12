# MYTHØS Ponto — Google Sheets + Google Login

## Arquitetura

```text
Expo/React Native → Google OAuth → Apps Script Web App → Google Sheets
```

O aplicativo usa o access token do Google apenas para provar a identidade. O Apps Script valida o token e consulta `USUARIOS` antes de aceitar qualquer operação.

## 1. Criar a planilha

Crie uma planilha Google vazia e abra **Extensões → Apps Script**. Cole `backend/Code.gs` e execute `setup()` uma vez.

Serão criadas as abas:

- `USUARIOS`
- `PONTO`
- `RELATORIOS`
- `EQUIPES`
- `AUDITORIA`

## 2. Cadastrar o Owner

Na aba `USUARIOS`, adicione:

```text
id | nome | gmail | cargo | equipe | status | criado_em
```

Exemplo:

```text
owner-001 | Seu Nome | seu-email@gmail.com | Owner | Geral | Ativo | 2026-08-11
```

Cargos:

- `Owner`, `Staff`, `ALL`: administração total
- `Manager`, `Líder`: gestão e relatórios
- `Admin²`, `Auxiliar`, `Funcionário`: próprio ponto

## 3. Publicar a API

No Apps Script:

**Implantar → Nova implantação → Aplicativo da Web**.

Configure para executar como a conta dona da planilha e escolha o nível de acesso compatível com sua organização. O Google documenta que um Web App precisa de `doGet` ou `doPost` e pode ser implantado pelo menu **Implantar → Nova implantação**. citeturn0search0turn0search1

Copie a URL que termina em `/exec`.

Teste abrindo a URL no navegador. A resposta esperada é semelhante a:

```json
{"ok":true,"service":"MYTHØS Ponto API","version":"2.1"}
```

## 4. Google OAuth

No Google Cloud Console, configure a tela de consentimento OAuth e crie um cliente OAuth Android e um cliente Web.

O cliente Android usa o package:

```text
br.com.mythos.ponto
```

Configure no ambiente do build:

```text
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_MYTHOS_API_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec
```

O aplicativo envia o access token ao Apps Script, que valida o token no endpoint oficial do Google antes de liberar o usuário cadastrado.

## 5. Fluxo do ponto

A sequência é validada no servidor:

```text
Entrada
  ↓
Início do intervalo
  ↓
Retorno do intervalo
  ↓
Saída
```

Batidas fora de sequência são recusadas. O servidor também usa `LockService` para evitar duas batidas simultâneas criarem uma sequência inconsistente.

## 6. Auditoria

Cada batida gera um registro na aba `AUDITORIA`. Operações administrativas e relatórios também são registrados.

## 7. Build Android

O projeto contém perfis EAS:

```bash
npx eas build --profile preview --platform android
```

gera um APK interno.

Para publicação:

```bash
npx eas build --profile production --platform android
```

gera o AAB.

As credenciais OAuth e a URL `/exec` precisam estar configuradas antes do build real.

## Segurança

Nunca coloque senha, service account, chave privada ou credencial de planilha dentro do APK. O Apps Script deve ser a única camada com acesso à planilha. Apps Script Web Apps podem executar como o proprietário ou como o usuário que acessa; escolha a identidade de execução de acordo com a política de segurança da organização. citeturn0search0turn0search5
