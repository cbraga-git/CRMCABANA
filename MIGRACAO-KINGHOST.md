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

## Status em 15/10/2026

A API independente em `/gestaocabana/` esta publicada. A consulta publica a
`/gestaocabana/api/index.php/health` confirmou PHP compativel, PDO PostgreSQL,
configuracao presente, conexao com o banco e esquema pronto. Resultado salvo
em `gestaocabana-health-check.json`.

O destino usa autenticacao propria em PHP. O CRM em `/crmcabana/` permanece
configurado para Supabase. O health nao confirma usuarios e dados importados,
nem equivalencia de contagens e saldos.

Proxima etapa: exportacao consistente conforme `IMPORTAR-DADOS-KINGHOST.md`,
preparacao do SQL local e importacao no destino vazio. Nao foi localizado
`exportacao.csv` no workspace nem acesso administrativo configurado aos bancos
nesta sessao. Nenhum dado do banco foi alterado nesta retomada.

Validacao local: sintaxe do CRM, 180 testes Node e quatro testes do conversor
passaram. PHP ausente no PATH local; testes PHP e integracao com banco nao
foram reexecutados nesta retomada.

## Retomada com acesso direto ao Supabase em 15/10/2026

A conexao OAuth salva foi reutilizada diretamente pelo protocolo MCP, com acesso
somente de leitura ao projeto imadtoifkuqbkzkuxcnk. Nao e necessario pedir ao
usuario para gerar manualmente o CSV ou autorizar novamente a origem.

Exportacao consistente concluida por uma unica consulta SELECT, incluindo os
usuarios de auth.users, colunas explicitas e fingerprints calculados na origem.
Arquivos privados locais: exportacao.csv e importar-kinghost.sql, ambos ignorados
pelo Git. O conversor validou as 93 instrucoes. A importacao integral foi
executada em PGlite isolado com o esquema do destino; todas as verificacoes de
conteudo e contagem passaram nas 22 tabelas.

Contagens relevantes da copia: 4 usuarios, 4 perfis, 166 registros crm_clients,
791 lancamentos financeiros, 1169 lancamentos Braga, 12 contas financeiras e
19 contas Braga. Nenhum registro foi escrito no Supabase ou KingHost.

Tentativa direta ao PostgreSQL KingHost: TCP respondeu, mas o servidor recusou
a origem com `no pg_hba.conf entry for host "177.69.22.98"`, para o usuario e
banco cabanamoveissobmedida, com SSL desabilitado conforme o endpoint existente.
A rejeicao ocorre na regra de acesso, antes de confirmar a senha. Nao foi
possivel inventariar nem importar o destino. Liberar o IP externo no painel ou
usar execucao privada no servidor e o proximo passo para prosseguir diretamente.

Esta copia e de validacao: a origem permanece ativa. A importacao definitiva
exige uma nova copia consistente durante a pausa de gravacoes e verificacao do
destino vazio, seguida da conferencia de saldos e login no servidor real.

## Acesso externo liberado

A nova tentativa apos a liberacao do IP passou pela regra de acesso e retornou
`password authentication failed for user "cabanamoveissobmedida"`. O impedimento
agora e a credencial local, nao o pg_hba.conf. A senha anteriormente informada
na configuracao nao foi aceita. Nenhuma importacao foi executada no destino.
Foi preparado um arquivo privado fora do repositorio em
`~/.codex/tmp/cabana-kinghost.private.json`, com o campo password vazio para
receber a mesma senha valida usada pelo PHP no servidor.

## Importacao confirmada em 15/10/2026

O usuario confirmou a pausa das edicoes no CRM antigo. Uma nova exportacao
consistente foi gerada diretamente do Supabase pela conexao OAuth existente.
O destino estava vazio, exceto pelos sete status iniciais, e teve seu estado
inicial salvo em arquivo privado fora do repositorio.

A importacao foi executada no PostgreSQL KingHost 13.22 com bloqueio das tabelas,
recusa de destino ocupado e conferencia de contagem e fingerprint de todas as
colunas nas 22 tabelas. Antes do COMMIT, os saldos agregados por conta e a
quantidade de lancamentos relacionados foram comparados diretamente entre
origem e destino: as 31 contas coincidiram. COMMIT confirmado e uma nova conexao
confirmou a persistencia dos registros.

Resultado: 4 usuarios e perfis, 166 registros de clientes, 791 lancamentos
financeiros e 1169 lancamentos Braga. Todos os quatro hashes de senha estao em
formatos reconhecidos. Perfis e bloqueios foram preservados da origem; nenhuma
senha foi redefinida. Resultado sem dados pessoais em
`migracao-kinghost-resultado.json`.

A pagina nova e o health responderam HTTP 200. A configuracao publicada usa
`new URL("api/index.php", window.location.href)` e aponta para a API PHP local.
A consulta de clientes sem autenticacao retornou 401, conforme esperado.

Pendente: login real de um usuario importado e validacao funcional pela
interface. Nao foi realizado login em nome de usuarios nem redefinida senha
para esse teste. O CRM antigo em /crmcabana/ ainda aponta ao Supabase: manter
as edicoes antigas pausadas e usar apenas o destino apos a validacao de login,
para evitar divergencia. Nenhum redirecionamento ou troca da configuracao do
CRM antigo foi executado. A origem foi preservada para recuperacao; se houver
novas gravacoes no destino, uma volta a origem exigira reconciliacao dos dados.
