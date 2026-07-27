# Guia Fotógrafo Casamento

Aplicação React + Express + MySQL com PWA, Web Push padrão VAPID, central de notificações e e-mails SMTP.

## Preparação

1. Copie `.env.example` para `.env`.
2. Configure o acesso ao MySQL.
3. Defina `JWT_SECRET`.
4. Gere uma chave mestra longa e aleatória em `PAYMENT_CREDENTIALS_ENCRYPTION_KEY`.
5. Instale as dependências com `npm install`.
6. Crie o banco vazio indicado em `DB_DATABASE`.
7. Execute `npm run db:bootstrap` para criar/completar as tabelas, inserir os exemplos iniciais e auditar o resultado.
8. Inicie com `npm run dev`.

Ao iniciar com o MySQL disponível, o servidor também executa automaticamente o bootstrap idempotente. O catálogo completo possui 66 tabelas. Tabelas, colunas, chaves e índices ausentes são adicionados sem apagar os dados já existentes.

## Fonte dos dados

- MySQL é obrigatório e é a fonte oficial dos dados funcionais.
- Os antigos exemplos continuam no projeto somente como entrada do seed idempotente e são gravados no MySQL.
- O frontend não usa exemplos locais como fallback quando o banco falha.
- `localStorage` é usado apenas para a preferência visual “não mostrar novamente” do convite de instalação PWA.

Para confirmar que o schema TypeScript e as migrações contêm exatamente as mesmas tabelas:

```text
npm run db:validate
```

Com o servidor em execução, `GET /api/db/test` audita conexão, tabelas, colunas, constraints e índices.

## Configuração pelo painel

Entre como administrador e abra **Comunicação**:

- **Configuração Push:** gere as chaves VAPID no backend e ative o Web Push.
- **Enviar Push:** crie rascunhos ou envie campanhas para todos, fotógrafos, noivas ou administradores.
- **E-mails SMTP:** informe as credenciais da hospedagem e teste a conexão.
- **Estatísticas:** acompanhe dispositivos ativos, fila e notificações não lidas.

A chave privada VAPID, o usuário SMTP e a senha SMTP são criptografados antes de serem persistidos e nunca são retornados integralmente pela API.

## PWA e notificações

- O Service Worker é registrado na compilação de produção.
- No iPhone e iPad, o usuário recebe instruções para adicionar o app à tela inicial antes de ativar Push.
- A fila oficial fica no MySQL; o worker apenas processa os registros persistidos.
- Orçamentos novos notificam o fotógrafo.
- Lembretes da agenda são materializados e enviados sem duplicidade.

## Validação e produção

```text
npm run lint
npm run db:validate
npm run build
npm start
```

Use HTTPS em produção. Web Push e Service Workers não funcionam em origem HTTP comum, exceto em `localhost`.

Workers de alto volume podem ser executados em processo dedicado futuramente, reutilizando os serviços persistentes já incluídos. Para uma única instância, o servidor inicia os processadores automaticamente.
