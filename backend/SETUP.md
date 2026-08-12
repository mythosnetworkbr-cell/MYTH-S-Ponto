# MYTHØS Ponto — Google Sheets + Google Login

## Arquitetura

APK → Google OAuth → access token Google → Apps Script → Google Sheets.

A planilha é o banco inicial. O APK nunca recebe credenciais da planilha.

## 1. Criar a planilha

Crie uma planilha Google vazia e abra **Extensões → Apps Script**. Cole `backend/Code.gs` e execute `setup()` uma vez.

## 2. Cadastrar o Owner

Na aba `USUARIOS`, adicione o primeiro usuário:

`id | nome | gmail | cargo | equipe | status | criado_em`

Use `Owner` no cargo e `Ativo` no status.

Cargos: Owner (total), Staff (total), ALL (administração), Manager (gestão + relatórios), Líder (equipe + relatórios), Admin² (somente próprio ponto), Auxiliar (somente próprio ponto), Funcionário (somente próprio ponto).

Todos batem ponto. Owner/Staff/ALL/Manager/Líder têm meta de 3 horas/dia; Admin²/Auxiliar/Funcionário têm meta de 2 horas/dia.

## 3. Publicar a API

No Apps Script: **Implantar → Nova implantação → Aplicativo da Web**. Execute como a conta dona da planilha e defina o acesso conforme a política da organização. Copie a URL `/exec`.

## 4. Google OAuth

No Google Cloud Console, configure a tela de consentimento OAuth e crie um cliente OAuth Android e um cliente Web. O cliente Android usa o package `br.com.mythos.ponto`.

Defina no ambiente do build:

- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_MYTHOS_API_URL`

O APK envia o access token Google e o Apps Script valida o token no endpoint oficial `oauth2.googleapis.com/tokeninfo` antes de liberar o usuário cadastrado.

## 5. Build

Depois de configurar as variáveis, faça o build Android. Sem Client IDs e URL da API, o login não consegue autenticar contas reais.

## Segurança

Nunca coloque senha, chave de serviço ou credencial da planilha dentro do APK. Para produção, use conta organizacional, permissões mínimas na planilha e auditoria periódica.
