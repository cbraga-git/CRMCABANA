# Financeiro Braga

Menu pessoal exclusivo da conta `fernandes.braga@gmail.com`. Disponibiliza os recursos ativos do Financeiro: visão geral, contas, transações, categorias, importação OFX/CSV, migração Mobills, tags, parcelamento, transferências, saldos e relatórios XLSX. A preferência de campos visíveis também fica separada da usada no Financeiro da empresa.

Os dados começam vazios e são armazenados nas oito tabelas `crm_braga_financial_*`. Não há cópia de lançamentos da empresa. Os resultados de orçamentos do CRM continuam no Financeiro empresarial.

## Ativar

1. No projeto Supabase `imadtoifkuqbkzkuxcnk`, execute `supabase-financeiro-braga.sql` pelo SQL Editor. A migração é aditiva e pode ser executada novamente.
2. Confirme que `fernandes.braga@gmail.com` existe no Supabase Auth e tem um perfil desbloqueado em `crm_profiles`. O perfil pode ser `user` ou `admin`.
3. Publique os arquivos do site pelo fluxo existente do GitHub Pages.
4. Entre com a conta do titular e abra **Financeiro Braga**. Cadastre suas contas e categorias pessoais antes dos lançamentos.

Somente o e-mail do usuário autenticado no Supabase Auth concede acesso. Outros administradores do CRM não têm acesso pelas políticas RLS. Usuários bloqueados e visitantes anônimos também não têm acesso. A migração não altera as permissões do Financeiro empresarial.

Se a migração ainda não foi aplicada, o módulo apresenta a mensagem de indisponibilidade e mantém os dados pessoais vazios. Não utiliza as contas da empresa como alternativa.

## Validação

- `npm run check` e `npm test`: sintaxe e regressões, incluindo isolamento, acesso, relatórios e troca de menus.
- `node tests/financial-braga-database.mjs`: executa as migrações e 112 verificações em um PostgreSQL descartável, usando PGlite como ferramenta de desenvolvimento. Requer `@electric-sql/pglite`, ou `PGLITE_MODULE` apontando para uma instalação externa.
- `node tests/financial-braga-browser.mjs`: executa 20 verificações de interface com o Supabase simulado. Requer Playwright, ou `PLAYWRIGHT_MODULE` apontando para uma instalação externa; `BROWSER_EXECUTABLE` pode apontar para um Chrome/Edge instalado.

Essas ferramentas de validação não são dependências do CRM. Os testes de banco e navegador usam dados fictícios e não alteram o Supabase real.
