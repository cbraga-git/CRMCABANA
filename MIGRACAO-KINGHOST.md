# Migração do CRM para PostgreSQL KingHost

Levantamento do código em 14/10/2026. Nenhuma alteração foi feita no banco de produção.

## Dependências atuais

- O navegador chama a API REST do Supabase; não existe servidor de aplicação neste projeto.
- Login, renovação de sessão e logout usam `/auth/v1`.
- Os scripts SQL referenciam `auth.users`, `auth.uid()` e permissões por usuário.
- Administração cria usuários, altera perfis e senhas por funções RPC.
- O Financeiro Braga exige autorização específica, independente da administração geral.
- A sincronização usa consultas periódicas, com intervalo de cinco segundos; não depende de WebSocket neste código.
- Edições de clientes usam `updated_at` para detectar conflitos.
- Importações, parcelamento, conciliação, backup e filtros dependem da semântica das consultas REST.

Os scripts locais definem cinco tabelas gerais e oito tabelas para cada financeiro. O esquema real de produção deve ser inventariado antes da exportação; scripts locais não substituem esse inventário.

## Informações necessárias

1. PostgreSQL KingHost: versão, servidor, porta, banco, usuário, disponibilidade de TLS e acesso externo.
2. Hospedagem: suporte a Node.js ou PHP com extensão PostgreSQL, variáveis privadas e método para executar tarefas de migração.
3. Escopo: manter Supabase Auth ou migrar também usuários e autenticação.
4. Origem: acesso administrativo de exportação do PostgreSQL Supabase e, se aplicável, dos usuários de autenticação.

Senhas do banco e segredos de autenticação devem permanecer no servidor ou no ambiente de migração, fora do Git e dos arquivos públicos do site.

## Sequência de execução

1. Inventariar tabelas, índices, restrições, funções, políticas e versões da origem e do destino.
2. Exportar uma cópia consistente do banco e registrar contagens por tabela.
3. Construir uma API no servidor com autorização equivalente à atual. Definir a estratégia de autenticação antes de adaptar as referências a usuários.
4. Preparar o esquema de destino preservando UUIDs, JSON de clientes e orçamentos, vínculos de lançamentos e datas.
5. Restaurar em ambiente separado e comparar registros, relacionamentos e saldos por conta.
6. Testar login, perfis bloqueados, separação dos financeiros, conflitos de edição, importação, parcelas e backup.
7. Definir uma janela para interromper gravações e fazer a cópia final. Não permitir gravações simultâneas em duas bases sem uma estratégia explícita de sincronização.
8. Publicar a configuração nova após a validação; manter o backup e a origem disponíveis para recuperação.

## Condições para concluir

- API e autenticação funcionando no destino escolhido.
- Contagens e saldos conferidos com uma exportação consistente.
- Todas as relações com usuários e parcelas preservadas.
- Acesso bancário restrito ao servidor de aplicação.
- CRM publicado usando o destino, com leitura e gravação verificadas.
- Migração final e procedimento de recuperação documentados.

## Situação

Levantamento inicial concluído. Aguardando os dados não secretos do PostgreSQL, o runtime disponível e a decisão sobre a autenticação. A produção continua usando o Supabase.
