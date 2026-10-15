# Transferir os dados do Supabase para a KingHost

O arquivo `kinghost-postgresql-completo.sql` precisa estar aplicado no destino.
A importacao e para o banco ainda sem usuarios e sem dados; os status iniciais
sao a unica excecao. Se encontrar registros, o script cancela a transacao.
Nao apague registros para contornar esse bloqueio: confira primeiro o destino.

1. Combine uma pausa nas alteracoes do CRM antigo e mantenha-a ate conferir a
   migracao. Guarde um backup do destino e mantenha o Supabase disponivel.
2. Abra `scripts/supabase-exportar-kinghost.sql`, copie todo o conteudo e execute
   no SQL Editor do projeto Supabase, com o papel `postgres`. Ele somente le os
   dados de origem e cria uma tabela temporaria na sessao.
3. Exporte o resultado que tem as colunas `seq,total,sql,md5` como **CSV**, com
   todas as linhas. Salve como `exportacao.csv` na pasta local do projeto.
4. No PowerShell, na pasta do projeto, execute:

   ```powershell
   python scripts/kinghost-preparar-importacao.py exportacao.csv importar-kinghost.sql
   ```

   O conversor verifica quantidade, ordem e checksum de todas as linhas.
   Se o editor truncar algum campo, sera necessario exportar novamente sem
   truncamento ou usar uma exportacao direta do PostgreSQL. Nao importe CSV
   incompleto nem copie manualmente uma celula truncada.
5. No administrador PostgreSQL da KingHost, selecione o banco configurado em
   `private/gestaocabana.php`. Importe o **SQL gerado**, inteiro, como proprietario
   das tabelas. Use a opcao de executar arquivo SQL, sem dividir a transacao.
   Nao envie esses arquivos para `www`, Git ou chat.
6. Confirme que a execucao terminou com COMMIT, sem erros. Em caso de erro,
   execute `ROLLBACK;` se a ferramenta mantiver a sessao aberta. Corrija a causa
   antes de repetir. Nao continue executando apenas trechos restantes.
7. Entre em `/gestaocabana/` com uma conta importada e confira clientes,
   orcamentos, parcelas, saldos por conta e acesso aos dois financeiros.

O arquivo verifica contagens e o conteudo de todas as colunas exportadas antes
do COMMIT. Preserva UUIDs, JSON, datas, perfis, registros de auditoria e os dois
financeiros; ajusta a sequencia da auditoria. Incompatibilidades de colunas,
tipos ou relacionamentos fazem a importacao falhar, sem descartar campos.

As senhas nao sao exportadas em texto: `auth.users.encrypted_password` vai para
`crm_users.password_hash`. O login PHP usa `password_verify`; contas com hashes
compativeis podem manter a senha. Contas sem senha (por exemplo, acesso social)
precisam de uma senha local por administracao. Sessoes e tokens do Supabase nao
sao migrados; cada usuario precisa entrar novamente. Confira bloqueios e
permissoes antes de liberar o acesso ao novo sistema.

Os arquivos CSV e SQL gerados contem dados pessoais e hashes de senha. Guarde-os
em armazenamento privado. Os scripts deste pacote nao contêm credenciais nem
executam a importacao automaticamente.

Validacao local: quatro testes do conversor e execucao do esquema, exportacao,
importacao, conferencia de conteudo e recusa de destino ocupado em PostgreSQL
embutido (PGlite), com dados ficticios; 93 instrucoes na exportacao de teste.
A execucao e a conferencia no Supabase/KingHost dependem do acesso aos bancos.

Referencia tecnica: https://www.postgresql.org/docs/13/functions-json.html
