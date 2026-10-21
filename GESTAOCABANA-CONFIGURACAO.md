# Gestão Cabana: validação PHP/PostgreSQL separada

Nova URL: https://cabanamoveissobmedida.com.br/gestaocabana/

O CRM atual em `/crmcabana/` foi preservado, com sua conexão Supabase. A nova pasta tem cópias independentes dos arquivos, API local, nome de cookie próprio e chaves de armazenamento do navegador próprias. Não há migração automática de registros ou de sessões entre as versões.

## Configurar pelo painel KingHost

Antes de enviar os arquivos, execute `python scripts/stamp-build.py .` para atualizar o campo Versão no formato `Build DD/MM/AAAA HH:MM · commit`, com horário de Brasília. Para um pacote separado, substitua `.` pela pasta do pacote. O script `scripts/deploy-kinghost.py` executa essa etapa automaticamente no pacote `release`.

1. No painel do domínio, escolha PHP 8.1 ou superior e habilite **PDO PostgreSQL / pdo_pgsql**. A nova URL informa se a extensão está disponível.
2. No gerenciador de arquivos, localize a pasta `www`. Crie uma pasta **private ao lado de www**, e não dentro dela. Pelo caminho informado no painel, ela deve ser `/home/cabanamoveissobmedida/private`.
3. Dentro de `private`, crie `gestaocabana.php`. Copie o modelo abaixo e preencha a senha somente nesse arquivo privado. Não envie a senha no chat ou ao GitHub.

```php
<?php
return [
    'enabled' => true,
    'dsn' => 'pgsql:host=pgsql52-farm1.kinghost.net;port=5432;dbname=cabanamoveissobmedida;sslmode=disable',
    'user' => 'cabanamoveissobmedida',
    'password' => 'SUA_SENHA_DO_POSTGRESQL',
    'rate_limit_dir' => '/home/cabanamoveissobmedida/private/gestaocabana-rate-limits',
];
```

O servidor PostgreSQL testado informou não oferecer SSL nessa conexão; por isso, o DSN usa `sslmode=disable`. Essa conexão não tem criptografia de transporte. Para exigir TLS, solicite à KingHost um endpoint PostgreSQL com SSL antes da adoção definitiva.

O usuário é o do PostgreSQL, não necessariamente a senha FTP. A pasta privada deve ser legível pelo PHP, e o PHP precisa conseguir criar a subpasta de controle de tentativas de login. Se o gerenciador mostrar somente o conteúdo de `www`, solicite ao suporte KingHost a criação do arquivo na pasta privada, ou a configuração da variável de ambiente `CABANA_CONFIG_FILE` com o caminho privado correto.

A senha não é enviada ao navegador. A API não oferece terminal, SQL arbitrário ou configuração pela web. O endpoint público `/gestaocabana/api/index.php/health` verifica o PHP, a extensão, a conexão e a presença das tabelas por metadados, sem expor dados ou credenciais. Sem configuração, a aplicação devolve uma mensagem de preparação e não recorre ao Supabase.

## Usuários e dados

O banco criado anteriormente tem a estrutura, mas ainda precisa receber os dados e os usuários. O login novo não cria automaticamente uma conta, não reutiliza tokens do Supabase e não tem senha padrão.

A importação deve preservar o UUID de cada usuário em `crm_users`, seus hashes compatíveis em `password_hash`, o perfil em `crm_profiles`, todos os registros de clientes e as relações financeiras. Não crie um usuário substituto com UUID diferente para importar os dados de produção. Se for necessário um administrador descartável para testes com dados fictícios, há o utilitário **somente CLI** `scripts/gestaocabana-create-admin.php`, que lê a senha pela entrada padrão e recusa sobrescrever contas existentes.

## Limites desta etapa

- A publicação em `/gestaocabana/` não troca a base do CRM atual e não importa os dados.
- A API PHP implementa autenticação própria, verificações de perfil/bloqueio, separação do Financeiro Braga, filtros e escrita parametrizados, renovação/logout, RPCs administrativas e lotes transacionais.
- A configuração inicial pode usar o proprietário do banco apenas neste ambiente privado de validação. Nesse caso o PostgreSQL permite contornar RLS por ser proprietário: a API aplica a autorização e a restrição por usuário antes de cada consulta. Nunca dê essa conexão ao navegador. Antes da adoção definitiva, revise com o administrador a separação de papéis e os privilégios do serviço de autenticação/administração.
- Cookies exigem HTTPS, são HttpOnly e têm caminho `/gestaocabana/`. Tokens não são aceitos sem a sessão correspondente. Senhas alteradas ou usuários bloqueados invalidam o acesso.
- Comparação dos dados importados, contagens, saldos, desempenho, concorrência e recuperação ainda precisa ser feita no servidor real antes da substituição do CRM atual.
- A cópia em `/gestaocabana/` não recebe automaticamente futuras alterações de interface feitas em `/crmcabana/`. Durante a validação, alterações equivalentes precisam ser aplicadas e testadas nas duas versões.

## Verificação inicial

Depois de criar o arquivo privado, recarregue a nova URL. Em seguida, valide um usuário importado e compare clientes, orçamentos, parcelas, saldos e restrições dos dois financeiros. A migração final exige uma janela sem gravações na origem para fazer a cópia consistente e a conferência final.

O Git da KingHost copia a branch `main` assim que há um push; os testes do GitHub são verificações posteriores e não bloqueiam esse webhook. Por isso, execute as verificações locais antes de publicar.
