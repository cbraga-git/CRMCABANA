<?php
declare(strict_types=1);

final class ApiError extends RuntimeException {
    public int $status;
    public function __construct(int $status, string $message) { parent::__construct($message); $this->status = $status; }
}

function identifier(string $value): string {
    if (!preg_match('/^[a-z_][a-z0-9_]*$/D', $value)) throw new ApiError(400, 'Identificador inválido.');
    return '"' . $value . '"';
}

function tableNames(): array {
    $tables = ['crm_clients', 'crm_profiles', 'crm_audit_logs', 'crm_budget_statuses', 'crm_presence'];
    foreach (['crm_financial_', 'crm_braga_financial_'] as $prefix) {
        foreach (['accounts', 'categories', 'cost_centers', 'entries', 'statement_imports', 'statement_items', 'reconciliations', 'budgets'] as $suffix) $tables[] = $prefix . $suffix;
    }
    return $tables;
}

function requireAdmin(array $user): void {
    if (($user['role'] ?? '') !== 'admin' || ($user['blocked'] ?? true)) throw new ApiError(403, 'Acesso restrito a administradores.');
}

function authorizeTable(string $table, string $method, array $user): void {
    if (!in_array($table, tableNames(), true)) throw new ApiError(404, 'Recurso não encontrado.');
    if ($user['blocked']) throw new ApiError(403, 'Usuário bloqueado.');
    if (str_starts_with($table, 'crm_braga_financial_')) {
        if (strtolower($user['email']) !== 'fernandes.braga@gmail.com') throw new ApiError(403, 'Acesso exclusivo ao Financeiro Braga.');
    } elseif (str_starts_with($table, 'crm_financial_') || $table === 'crm_audit_logs') requireAdmin($user);
    if ($table === 'crm_profiles' && !in_array($method, ['GET', 'HEAD'], true)) throw new ApiError(403, 'Perfis devem ser alterados pela administração.');
    if ($table === 'crm_audit_logs' && !in_array($method, ['GET', 'HEAD'], true)) throw new ApiError(403, 'O histórico é somente leitura.');
    if ($table === 'crm_budget_statuses' && !in_array($method, ['GET', 'HEAD'], true)) requireAdmin($user);
}

function rowScope(string $table, string $method, array $user, array &$params): string {
    if (($table === 'crm_clients' && $user['role'] !== 'admin') || ($table === 'crm_presence' && !in_array($method, ['GET', 'HEAD'], true))) {
        $params[] = $user['id']; return '"user_id" = ?';
    }
    if ($table === 'crm_profiles' && $user['role'] !== 'admin') { $params[] = $user['id']; return '"id" = ?'; }
    return 'TRUE';
}

function filterSql(array $query, array $columns, array &$params): string {
    $conditions = [];
    foreach ($query as $column => $filter) {
        if (in_array($column, ['select', 'order', 'limit', 'offset', 'on_conflict'], true)) continue;
        if (!isset($columns[$column]) || !is_string($filter)) throw new ApiError(400, 'Filtro não permitido.');
        $name = identifier($column);
        [$operator, $value] = array_pad(explode('.', $filter, 2), 2, '');
        $operators = ['eq' => '=', 'neq' => '<>', 'gt' => '>', 'gte' => '>=', 'lt' => '<', 'lte' => '<=', 'like' => 'LIKE', 'ilike' => 'ILIKE'];
        if (isset($operators[$operator])) {
            $conditions[] = $name . ' ' . $operators[$operator] . ' ?'; $params[] = $value;
        } elseif ($operator === 'is' && in_array($value, ['null', 'true', 'false'], true)) {
            $conditions[] = $name . ' IS ' . strtoupper($value);
        } elseif ($operator === 'in' && preg_match('/^\((.*)\)$/sD', $value, $matches)) {
            $values = str_getcsv($matches[1], ',', '"', '');
            if (count($values) > 2000) throw new ApiError(400, 'Filtro muito grande.');
            $conditions[] = $name . ' IN (' . implode(',', array_fill(0, count($values), '?')) . ')';
            array_push($params, ...$values);
        } else throw new ApiError(400, 'Operador de filtro não permitido.');
    }
    return $conditions ? implode(' AND ', $conditions) : 'TRUE';
}

function selectSql(string $selection, array $columns): string {
    if ($selection === '*') return '*';
    return implode(',', array_map(function ($column) use ($columns) {
        if (!isset($columns[$column])) throw new ApiError(400, 'Coluna não permitida.');
        return identifier($column);
    }, explode(',', $selection)));
}

function orderSql(string $order, array $columns): string {
    if ($order === '') return '';
    $parts = [];
    foreach (explode(',', $order) as $item) {
        if (!preg_match('/^([a-z_][a-z0-9_]*)(?:\.(asc|desc))?(?:\.(nullsfirst|nullslast))?$/D', $item, $m) || !isset($columns[$m[1]])) throw new ApiError(400, 'Ordenação inválida.');
        $parts[] = identifier($m[1]) . ' ' . strtoupper($m[2] ?? 'asc') . (isset($m[3]) ? ($m[3] === 'nullsfirst' ? ' NULLS FIRST' : ' NULLS LAST') : '');
    }
    return ' ORDER BY ' . implode(',', $parts);
}

function bodyJson(): array {
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 16777216) throw new ApiError(413, 'Conteúdo excede o limite de 16 MB.');
    $raw = file_get_contents('php://input', false, null, 0, 16777217);
    if ($raw === false || strlen($raw) > 16777216) throw new ApiError(413, 'Conteúdo muito grande.');
    try { $value = json_decode($raw, false, 128, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { throw new ApiError(400, 'JSON inválido.'); }
    if ($value instanceof stdClass) $value = get_object_vars($value);
    elseif (is_array($value)) $value = array_map(fn($item) => $item instanceof stdClass ? get_object_vars($item) : $item, $value);
    else throw new ApiError(400, 'Envie um objeto ou lista JSON.');
    return $value;
}

function query(PDO $db, string $sql, array $params = []): PDOStatement {
    $statement = $db->prepare($sql);
    foreach (array_values($params) as $i => $value) {
        if (is_array($value) || is_object($value)) $value = json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        $type = is_bool($value) ? PDO::PARAM_BOOL : (is_int($value) ? PDO::PARAM_INT : ($value === null ? PDO::PARAM_NULL : PDO::PARAM_STR));
        $statement->bindValue($i + 1, $value, $type);
    }
    $statement->execute(); return $statement;
}

function columns(PDO $db, string $table): array {
    $rows = query($db, 'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = \'public\' AND table_name = ?', [$table])->fetchAll();
    return array_column($rows, 'data_type', 'column_name');
}

function serializeRows(array $rows, array $columns): array {
    foreach ($rows as &$row) foreach ($row as $key => &$value) {
        if ($value === null) continue;
        if (in_array($columns[$key] ?? '', ['json', 'jsonb'], true) && is_string($value)) $value = json_decode($value, false, 128, JSON_THROW_ON_ERROR);
        elseif (($columns[$key] ?? '') === 'boolean') $value = in_array($value, [true, 't', 'true', '1', 1], true);
    }
    return $rows;
}

function uuid(): string {
    $bytes = random_bytes(16); $bytes[6] = chr((ord($bytes[6]) & 15) | 64); $bytes[8] = chr((ord($bytes[8]) & 63) | 128);
    $hex = bin2hex($bytes); return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4) . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20);
}

function readConfig(): array {
    $path = getenv('CABANA_CONFIG_FILE') ?: dirname(__DIR__, 3) . '/private/gestaocabana.php';
    if (!is_file($path)) throw new ApiError(503, 'Gestão Cabana em preparação. Configure o arquivo privado de conexão PostgreSQL no servidor. O CRM atual continua disponível em /crmcabana/.');
    $config = require $path;
    if (!is_array($config) || empty($config['enabled'])) throw new ApiError(503, 'Gestão Cabana aguardando configuração e validação do banco.');
    return $config;
}

function connectDb(array $config): PDO {
    if (!extension_loaded('pdo_pgsql')) throw new ApiError(503, 'A extensão PHP pdo_pgsql precisa ser habilitada na KingHost.');
    $db = new PDO($config['dsn'], $config['user'], $config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    $db->exec("SET TIME ZONE 'America/Sao_Paulo'");
    return $db;
}

function databaseReadinessError(Throwable $error): string {
    $message = strtolower($error->getMessage());
    if (str_contains($message, 'does not support ssl') || str_contains($message, 'ssl is not enabled')) return 'server_ssl_unavailable';
    if (str_contains($message, 'certificate') || str_contains($message, 'ssl error')) return 'ssl_validation_failed';
    if (str_contains($message, 'password authentication failed') || str_contains($message, 'authentication failed')) return 'database_credentials_rejected';
    if (str_contains($message, 'no pg_hba.conf entry')) return 'database_access_not_allowed';
    if (str_contains($message, 'database') && str_contains($message, 'does not exist')) return 'database_not_found';
    if (str_contains($message, 'could not translate host name') || str_contains($message, 'could not resolve')) return 'database_host_not_found';
    if (str_contains($message, 'timeout') || str_contains($message, 'timed out')) return 'database_connection_timeout';
    if (str_contains($message, 'connection refused')) return 'database_connection_refused';
    if (str_contains($message, 'permission denied')) return 'database_permissions_missing';
    if (str_contains($message, 'could not find driver')) return 'postgresql_driver_missing';
    return 'database_connection_failed';
}

function currentUser(PDO $db): array {
    $id = $_SESSION['user_id'] ?? null;
    $token = $_SESSION['token'] ?? '';
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$id || !$token || !hash_equals('Bearer ' . $token, $authorization) || ($_SESSION['expires'] ?? 0) < time()) throw new ApiError(401, 'Sessão expirada. Entre novamente.');
    $user = query($db, 'SELECT u.id, u.email, u.password_hash, p.role, p.blocked FROM public.crm_users u JOIN public.crm_profiles p ON p.id = u.id WHERE u.id = ?', [$id])->fetch();
    if (!$user || $user['blocked'] || !hash_equals($_SESSION['password_version'] ?? '', hash('sha256', $user['password_hash'] ?? ''))) throw new ApiError(401, 'Sessão revogada ou usuário bloqueado.');
    return $user;
}

function sessionPayload(array $user): array {
    return ['access_token' => $_SESSION['token'], 'refresh_token' => $_SESSION['refresh'], 'token_type' => 'bearer', 'expires_in' => 3600, 'expires_at' => time() + 3600, 'user' => ['id' => $user['id'], 'email' => $user['email']]];
}

function loginRateLimit(string $directory, string $email): void {
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) throw new ApiError(503, 'Não foi possível preparar o controle de acesso.');
    foreach (['ip:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 'account:' . strtolower($email)] as $key) {
        $path = $directory . '/' . hash('sha256', $key) . '.json';
        $handle = fopen($path, 'c+');
        if (!$handle || !flock($handle, LOCK_EX)) throw new ApiError(503, 'Controle de acesso indisponível.');
        $entry = json_decode(stream_get_contents($handle) ?: '{}', true) ?: [];
        if (($entry['until'] ?? 0) < time()) $entry = ['count' => 0, 'until' => time() + 900];
        if ($entry['count'] >= 30) { flock($handle, LOCK_UN); fclose($handle); throw new ApiError(429, 'Muitas tentativas. Aguarde 15 minutos.'); }
        $entry['count']++; rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($entry)); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
    }
}

function audit(PDO $db, array $user, string $action, ?string $target = null, ?string $email = null): void {
    query($db, 'INSERT INTO public.crm_audit_logs(actor_id, actor_email, action, target_user_id, target_email) VALUES(?,?,?,?,?)', [$user['id'], $user['email'], $action, $target, $email]);
}
