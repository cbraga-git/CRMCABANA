<?php
declare(strict_types=1);
ini_set('display_errors', '0');
date_default_timezone_set('America/Sao_Paulo');
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond($value, int $status = 200): never {
    http_response_code($status);
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function handleAuth(PDO $db, array $config, string $path): never {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new ApiError(405, 'Método não permitido.');
    if ($path === '/auth/v1/logout') {
        currentUser($db); $_SESSION = []; session_destroy(); respond(null, 200);
    }
    if ($path !== '/auth/v1/token') throw new ApiError(404, 'Recurso não encontrado.');
    $body = bodyJson();
    if (($_GET['grant_type'] ?? '') === 'refresh_token') {
        if (empty($_SESSION['refresh']) || !hash_equals($_SESSION['refresh'], (string)($body['refresh_token'] ?? '')) || ($_SESSION['expires'] ?? 0) < time()) throw new ApiError(401, 'Sessão expirada.');
        $oldAuthorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . ($_SESSION['token'] ?? '');
        $user = currentUser($db); $_SERVER['HTTP_AUTHORIZATION'] = $oldAuthorization;
        respond(sessionPayload($user));
    }
    if (($_GET['grant_type'] ?? '') !== 'password') throw new ApiError(400, 'Tipo de autenticação inválido.');
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    if (strlen($email) > 320 || strlen($password) > 1024) throw new ApiError(400, 'Credenciais inválidas.');
    loginRateLimit($config['rate_limit_dir'] ?? dirname(__DIR__, 3) . '/private/gestaocabana-rate-limits', $email);
    $user = query($db, 'SELECT u.id, u.email, u.password_hash, p.role, p.blocked FROM public.crm_users u JOIN public.crm_profiles p ON p.id = u.id WHERE lower(u.email) = ?', [$email])->fetch();
    $dummy = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
    $valid = password_verify($password, $user['password_hash'] ?? $dummy);
    if (!$user || !$valid || $user['blocked']) throw new ApiError(401, 'E-mail ou senha inválidos, ou usuário bloqueado.');
    session_regenerate_id(true);
    $_SESSION = ['user_id' => $user['id'], 'token' => bin2hex(random_bytes(32)), 'refresh' => bin2hex(random_bytes(32)), 'expires' => time() + 28800, 'password_version' => hash('sha256', $user['password_hash'])];
    respond(sessionPayload($user));
}

function handleRpc(PDO $db, array $user, string $name): never {
    requireAdmin($user);
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new ApiError(405, 'Método não permitido.');
    $body = bodyJson(); $db->beginTransaction();
    if ($name === 'crm_admin_replace_budget_statuses') {
        $statuses = $body['statuses'] ?? null;
        if (!is_array($statuses) || count($statuses) < 1 || count($statuses) > 100) throw new ApiError(400, 'Lista de status inválida.');
        $statuses = array_map(fn($row) => $row instanceof stdClass ? get_object_vars($row) : $row, $statuses);
        $seen = [];
        foreach ($statuses as $row) {
            $label = trim((string)($row['name'] ?? ''));
            if ($label === '' || strlen($label) > 240 || isset($seen[$label]) || (empty($row['applies_to_budget']) && empty($row['applies_to_order']))) throw new ApiError(400, 'Status inválido ou duplicado.');
            $seen[$label] = true;
        }
        $db->exec('DELETE FROM public.crm_budget_statuses');
        foreach ($statuses as $row) query($db, 'INSERT INTO public.crm_budget_statuses(name, applies_to_budget, applies_to_order, sort_order) VALUES(?,?,?,?)', [$row['name'], (bool)$row['applies_to_budget'], (bool)$row['applies_to_order'], (int)($row['sort_order'] ?? 0)]);
        audit($db, $user, 'replace_budget_statuses'); $db->commit(); respond(true);
    }
    if (!in_array($name, ['crm_admin_create_user', 'crm_admin_update_user', 'crm_admin_set_password'], true)) throw new ApiError(404, 'Operação não encontrada.');
    $id = $name === 'crm_admin_create_user' ? uuid() : (string)($body['target_user_id'] ?? '');
    if (!preg_match('/^[a-f0-9-]{36}$/iD', $id)) throw new ApiError(400, 'Identificador inválido.');
    if ($name !== 'crm_admin_create_user') {
        if (!query($db, 'SELECT id FROM public.crm_users WHERE id = ? FOR UPDATE', [$id])->fetch()) throw new ApiError(404, 'Usuário não encontrado.');
    }
    if ($name !== 'crm_admin_set_password') {
        $email = strtolower(trim((string)($body['user_email'] ?? ''))); $role = $body['user_role'] ?? 'user';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($role, ['admin', 'user'], true)) throw new ApiError(400, 'E-mail ou perfil inválido.');
        $blocked = (bool)($body['user_blocked'] ?? false);
        if ($id === $user['id'] && ($blocked || $role !== 'admin' || $email !== strtolower($user['email']))) throw new ApiError(400, 'Não altere seu próprio e-mail, bloqueio ou perfil.');
        if ($name === 'crm_admin_create_user') {
            query($db, 'INSERT INTO public.crm_users(id,email) VALUES(?,?)', [$id, $email]);
            query($db, 'INSERT INTO public.crm_profiles(id,email,role) VALUES(?,?,?)', [$id, $email, $role]);
        } else {
            query($db, 'UPDATE public.crm_users SET email=?, updated_at=clock_timestamp() WHERE id=?', [$email, $id]);
            query($db, 'UPDATE public.crm_profiles SET email=?, role=?, blocked=?, updated_at=clock_timestamp() WHERE id=?', [$email, $role, $blocked, $id]);
        }
    }
    if ($name !== 'crm_admin_update_user') {
        $password = (string)($body['user_password'] ?? '');
        if (strlen($password) < 6 || strlen($password) > 72) throw new ApiError(400, 'A senha deve ter entre 6 e 72 bytes.');
        query($db, 'UPDATE public.crm_users SET password_hash=?, updated_at=clock_timestamp() WHERE id=?', [password_hash($password, PASSWORD_DEFAULT), $id]);
    }
    audit($db, $user, $name, $id, $email ?? null); $db->commit(); respond(['id' => $id]);
}

function handleTable(PDO $db, array $user, string $table): never {
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'], true)) throw new ApiError(405, 'Método não permitido.');
    authorizeTable($table, $method, $user);
    $columns = columns($db, $table);
    if (!$columns) throw new ApiError(503, 'A estrutura PostgreSQL ainda precisa ser instalada.');
    $params = []; $scope = rowScope($table, $method, $user, $params);
    $where = $scope . ' AND (' . filterSql($_GET, $columns, $params) . ')';
    $tableSql = 'public.' . identifier($table);
    $selection = selectSql((string)($_GET['select'] ?? '*'), $columns);
    $prefer = $_SERVER['HTTP_PREFER'] ?? '';
    if ($method === 'GET' || $method === 'HEAD') {
        $limit = filter_var($_GET['limit'] ?? 1000, FILTER_VALIDATE_INT); $offset = filter_var($_GET['offset'] ?? 0, FILTER_VALIDATE_INT);
        if ($limit === false || $limit < 1 || $limit > 10000 || $offset === false || $offset < 0) throw new ApiError(400, 'Paginação inválida.');
        $total = str_contains($prefer, 'count=exact') ? (int)query($db, 'SELECT count(*) FROM ' . $tableSql . ' WHERE ' . $where, $params)->fetchColumn() : '*';
        $rows = query($db, 'SELECT ' . $selection . ' FROM ' . $tableSql . ' WHERE ' . $where . orderSql((string)($_GET['order'] ?? ''), $columns) . ' LIMIT ' . $limit . ' OFFSET ' . $offset, $params)->fetchAll();
        header('Content-Range: ' . ($rows ? $offset . '-' . ($offset + count($rows) - 1) : '*') . '/' . $total);
        respond(serializeRows($rows, $columns));
    }
    if ($method !== 'POST' && !array_diff(array_keys($_GET), ['select', 'order', 'limit', 'offset', 'on_conflict'])) throw new ApiError(400, 'Informe um filtro para alterar ou excluir registros.');
    $db->beginTransaction(); query($db, "SELECT set_config('crm.user_id', ?, true)", [$user['id']]);
    if ($method === 'DELETE') {
        $rows = query($db, 'DELETE FROM ' . $tableSql . ' WHERE ' . $where . ' RETURNING *', $params)->fetchAll();
    } else {
        $body = bodyJson(); $batch = $method === 'POST' && array_is_list($body) ? $body : [$body];
        if (count($batch) > 10000 || !$batch) throw new ApiError(400, 'Lote inválido.');
        $rows = [];
        foreach ($batch as $values) {
            if (!is_array($values) || array_is_list($values)) throw new ApiError(400, 'Registro inválido.');
            foreach ($values as $column => $value) if (!isset($columns[$column])) throw new ApiError(400, 'Coluna não permitida: ' . $column);
            if ($method === 'PATCH' && array_intersect(array_keys($values), ['id', 'session_id', 'created_by', 'imported_by', 'reconciled_by', 'created_at'])) throw new ApiError(400, 'Campo protegido.');
            if ($table === 'crm_clients' && $user['role'] !== 'admin') $values['user_id'] = $user['id'];
            if ($table === 'crm_presence') { $values['user_id'] = $user['id']; $values['email'] = $user['email']; }
            if (isset($columns['updated_at'])) $values['updated_at'] = (new DateTimeImmutable())->format('Y-m-d\TH:i:s.uP');
            if ($method === 'PATCH') {
                $sets = []; $bound = [];
                foreach ($values as $column => $value) { $sets[] = identifier($column) . '=?'; $bound[] = $value; }
                if (!$sets) throw new ApiError(400, 'Nenhuma alteração informada.');
                $rows = query($db, 'UPDATE ' . $tableSql . ' SET ' . implode(',', $sets) . ' WHERE ' . $where . ' RETURNING *', array_merge($bound, $params))->fetchAll();
            } else {
                foreach (['created_by', 'imported_by', 'reconciled_by'] as $creator) if (isset($columns[$creator])) $values[$creator] = $user['id'];
                $conflict = $_GET['on_conflict'] ?? null; $clause = '';
                if ($conflict !== null) {
                    if (!in_array($conflict, ['id', 'session_id'], true) || !isset($columns[$conflict]) || !isset($values[$conflict])) throw new ApiError(400, 'Chave de atualização inválida.');
                    if ($table === 'crm_clients' && $user['role'] !== 'admin') {
                        $existing = query($db, 'SELECT user_id FROM public.crm_clients WHERE id=? FOR UPDATE', [$values['id']])->fetch();
                        if ($existing && $existing['user_id'] !== $user['id']) throw new ApiError(403, 'Cliente pertence a outro usuário.');
                    }
                    if ($table === 'crm_presence') {
                        $existing = query($db, 'SELECT user_id FROM public.crm_presence WHERE session_id=? FOR UPDATE', [$values['session_id']])->fetch();
                        if ($existing && $existing['user_id'] !== $user['id']) throw new ApiError(403, 'Sessão pertence a outro usuário.');
                    }
                    $updates = [];
                    foreach ($values as $column => $value) if (!in_array($column, [$conflict, 'created_at', 'created_by', 'imported_by', 'reconciled_by'], true)) $updates[] = identifier($column) . '=EXCLUDED.' . identifier($column);
                    $clause = ' ON CONFLICT (' . identifier($conflict) . ') ' . (str_contains($prefer, 'resolution=ignore-duplicates') || !$updates ? 'DO NOTHING' : 'DO UPDATE SET ' . implode(',', $updates));
                    if ($updates && !str_contains($prefer, 'resolution=ignore-duplicates') && ($table === 'crm_presence' || ($table === 'crm_clients' && $user['role'] !== 'admin'))) $clause .= ' WHERE ' . identifier($table) . '.user_id = EXCLUDED.user_id';
                }
                $names = implode(',', array_map('identifier', array_keys($values)));
                $inserted = query($db, 'INSERT INTO ' . $tableSql . '(' . $names . ') VALUES(' . implode(',', array_fill(0, count($values), '?')) . ')' . $clause . ' RETURNING *', array_values($values))->fetchAll();
                array_push($rows, ...$inserted);
            }
        }
    }
    $db->commit();
    if (str_contains($prefer, 'return=representation')) respond(serializeRows($rows, $columns), $method === 'POST' ? 201 : 200);
    respond(null, 204);
}

try {
    $path = $_SERVER['PATH_INFO'] ?? '';
    if ($path === '/health') {
        $configured = false;
        try { $settings = readConfig(); $configured = true; } catch (ApiError $e) {}
        $health = ['service' => 'gestaocabana-php', 'php_supported' => PHP_VERSION_ID >= 80100, 'pdo_pgsql' => extension_loaded('pdo_pgsql'), 'configured' => $configured, 'database_connected' => false, 'schema_ready' => false];
        if ($configured && extension_loaded('pdo_pgsql')) {
            try {
                // Conexão curta e leitura de metadados: não expõe dados nem credenciais.
                if (!str_contains($settings['dsn'], 'connect_timeout=')) $settings['dsn'] .= ';connect_timeout=5';
                $probe = connectDb($settings);
                $expected = array_merge(['crm_users'], tableNames());
                $available = query($probe, "SELECT table_name FROM information_schema.tables WHERE table_schema='public'")->fetchAll(PDO::FETCH_COLUMN);
                $health['database_connected'] = true;
                $health['schema_ready'] = !array_diff($expected, $available);
                if (!$health['schema_ready']) $health['database_error'] = 'database_schema_incomplete';
            } catch (Throwable $error) { $health['database_error'] = databaseReadinessError($error); }
        }
        respond($health, $health['schema_ready'] ? 200 : 503);
    }
    if (PHP_VERSION_ID < 80100) throw new ApiError(503, 'Habilite PHP 8.1 ou superior para a Gestão Cabana.');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]) throw new ApiError(403, 'Origem não permitida.');
    $config = readConfig(); $db = connectDb($config);
    ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1');
    session_name('CABANA_GESTAO_SID');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/gestaocabana/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    if (str_starts_with($path, '/auth/v1/')) handleAuth($db, $config, $path);
    $user = currentUser($db); session_write_close();
    if (preg_match('#^/rest/v1/rpc/([a-z_]+)$#D', $path, $matches)) handleRpc($db, $user, $matches[1]);
    if (preg_match('#^/rest/v1/([a-z_]+)$#D', $path, $matches)) handleTable($db, $user, $matches[1]);
    throw new ApiError(404, 'Recurso não encontrado.');
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        try { $db->rollBack(); } catch (Throwable $rollbackError) { error_log('gestaocabana rollback: ' . $rollbackError->getMessage()); $db = null; }
    }
    if ($e instanceof ApiError) respond(['message' => $e->getMessage(), 'msg' => $e->getMessage(), 'error_description' => $e->getMessage()], $e->status);
    error_log('gestaocabana: ' . $e->getMessage());
    $status = $e instanceof PDOException && in_array((string)$e->getCode(), ['23505', '23503', '23514', '22P02'], true) ? 409 : 503;
    respond(['message' => $status === 409 ? 'Registro duplicado, vínculo ou valor inválido. Confira os dados.' : 'API PostgreSQL indisponível. Verifique a configuração privada e a estrutura do banco.'], $status);
}
