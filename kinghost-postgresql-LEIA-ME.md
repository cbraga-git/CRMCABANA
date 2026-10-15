# Criar a estrutura do CRM na KingHost

Arquivo: `kinghost-postgresql-completo.sql`.

1. Crie um banco PostgreSQL vazio no painel KingHost. É necessário PostgreSQL 13 ou superior.
2. Abra a ferramenta de administração do PostgreSQL e selecione esse banco.
3. Execute o arquivo SQL completo com o usuário proprietário do banco, usando a opção SQL ou importação.
4. Confirme as tabelas com:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'crm_%'
ORDER BY tablename;
```

São 22 tabelas: usuários, cinco tabelas gerais do CRM, oito do Financeiro e oito do Financeiro Braga. Orçamentos, ambientes, pagamentos e contas bancárias dos documentos permanecem no JSON `crm_clients.data`, como no sistema atual.

O arquivo cria estrutura, índices, restrições, gatilhos de atualização financeira, políticas de acesso e os status iniciais de orçamento. Não cria usuários ou senhas padrão, não importa dados do Supabase e não troca a configuração do site.

Execute em um banco vazio: `IF NOT EXISTS` permite repetir a criação, mas não adapta uma tabela antiga com estrutura diferente. O script é uma transação; se houver erro, a criação não será confirmada.

Na importação, carregue primeiro `crm_users` com os mesmos UUIDs dos usuários do Supabase e depois os perfis e demais registros. `password_hash` é reservado à futura API; importar hashes exige escolher antes o mecanismo de autenticação compatível. Preserve os UUIDs financeiros e os identificadores dos grupos de parcelas. Os usuários iniciais e permissões administrativas devem vir da migração, sem contas automáticas neste script.

As políticas usam `crm.user_id`, que a API deve definir com `SET LOCAL` após validar o usuário, dentro de cada transação. A conexão da API precisa de papel próprio, diferente do proprietário das tabelas e sem `SUPERUSER` ou `BYPASSRLS`. Login e administração de usuários exigem implementação e privilégios específicos no servidor; os serviços e RPCs do Supabase não são recriados por este arquivo. Nunca forneça a conexão PostgreSQL diretamente ao navegador.

Validação realizada: sintaxe das 101 instruções conferida com parser PostgreSQL. Execução em PostgreSQL KingHost ainda não realizada.
