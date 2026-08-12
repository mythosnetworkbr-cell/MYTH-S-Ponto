# MYTHØS Ponto — Google Sheets

## 1. Criar a planilha

Crie uma planilha Google vazia e abra **Extensões → Apps Script**.

## 2. Instalar a API

Cole o conteúdo de `backend/Code.gs` no editor do Apps Script e execute `setup()` uma vez. Autorize o script.

O script cria as abas:

- USUARIOS
- PONTO
- RELATORIOS
- EQUIPES
- AUDITORIA

## 3. Publicar

No Apps Script: **Implantar → Nova implantação → Aplicativo da Web**.

Use uma conta da organização/proprietário para executar o script e restrinja quem pode acessar conforme a política da organização. Copie a URL da implantação para a configuração do aplicativo.

## 4. Primeiro usuário

Na aba `USUARIOS`, cadastre manualmente o Owner antes do primeiro login:

`id | nome | gmail | cargo | equipe | status | criado_em`

Cargo inicial: `Owner`.

## 5. Segurança

A planilha nunca deve ser colocada dentro do APK. O aplicativo deve chamar apenas a URL do Apps Script. Para produção, recomenda-se colocar uma camada de autenticação Google verificável no backend e validar o token/identidade antes de aceitar operações sensíveis.

A API já bloqueia relatórios e administração por cargo, mas a identidade do Gmail precisa ser validada por uma camada OAuth/Google Identity antes da versão de produção.
