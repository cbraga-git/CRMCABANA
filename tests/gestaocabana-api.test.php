<?php
declare(strict_types=1);
require __DIR__ . '/../gestaocabana/api/lib.php';
function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
function denied(callable $call, int $status): void {
    try { $call(); } catch (ApiError $e) { check($e->status === $status, 'HTTP esperado ' . $status); return; }
    throw new RuntimeException('Operação deveria ser rejeitada.');
}
$admin = ['id' => 'admin', 'email' => 'admin@example.com', 'role' => 'admin', 'blocked' => false];
$user = ['id' => 'user', 'email' => 'user@example.com', 'role' => 'user', 'blocked' => false];
$braga = ['id' => 'braga', 'email' => 'fernandes.braga@gmail.com', 'role' => 'user', 'blocked' => false];
authorizeTable('crm_financial_accounts', 'POST', $admin);
authorizeTable('crm_braga_financial_accounts', 'POST', $braga);
denied(fn() => authorizeTable('crm_braga_financial_accounts', 'GET', $admin), 403);
denied(fn() => authorizeTable('crm_financial_accounts', 'GET', $user), 403);
denied(fn() => authorizeTable('crm_clients', 'GET', array_merge($admin, ['blocked' => true])), 403);
denied(fn() => authorizeTable('crm_users', 'GET', $admin), 404);
denied(fn() => authorizeTable('crm_profiles', 'PATCH', $user), 403);
denied(fn() => authorizeTable('crm_audit_logs', 'DELETE', $admin), 403);
denied(fn() => authorizeTable('crm_budget_statuses', 'POST', $user), 403);
$params = [];
check(rowScope('crm_clients', 'GET', $user, $params) === '"user_id" = ?', 'Clientes devem ser restritos por usuário.');
check($params === ['user'], 'UUID deve ser parâmetro.');
$cols = ['id' => 'uuid', 'status' => 'text', 'amount' => 'numeric', 'updated_at' => 'timestamp with time zone'];
$params = [];
$where = filterSql(['id' => 'eq.x\'; DROP TABLE crm_clients; --', 'status' => 'in.(pending,overdue)', 'amount' => 'gte.5'], $cols, $params);
check(!str_contains($where, 'DROP'), 'Valores não devem entrar no SQL.');
check(count($params) === 4, 'Filtros devem preservar parâmetros.');
denied(function () use ($cols) { $params = []; filterSql(['secret' => 'eq.1'], $cols, $params); }, 400);
denied(function () use ($cols) { $params = []; filterSql(['id' => 'or.1=1'], $cols, $params); }, 400);
denied(fn() => selectSql('password_hash', $cols), 400);
denied(fn() => orderSql('id.desc;drop', $cols), 400);
check(selectSql('id,status', $cols) === '"id","status"', 'Seleção de colunas.');
check(orderSql('id.asc,updated_at.desc', $cols) === ' ORDER BY "id" ASC,"updated_at" DESC', 'Ordenação.');
$rows = serializeRows([['data' => '{"settings":{},"rows":[]}', 'active' => 't']], ['data' => 'jsonb', 'active' => 'boolean']);
check(json_encode($rows[0]['data']) === '{"settings":{},"rows":[]}', 'JSON precisa preservar objetos e listas vazias.');
check($rows[0]['active'] === true, 'Booleanos PostgreSQL.');
check(preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/D', uuid()) === 1, 'UUID válido.');
echo "API PHP: autorização, isolamento, SQL parametrizado, filtros, JSON e UUID validados.\n";
