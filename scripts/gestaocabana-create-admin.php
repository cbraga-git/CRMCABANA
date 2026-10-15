<?php
// Somente linha de comando; nunca expor pela web.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../gestaocabana/api/lib.php';
$email = strtolower(trim($argv[1] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { fwrite(STDERR, "Uso: php scripts/gestaocabana-create-admin.php email@dominio (senha pela entrada padrão)\n"); exit(1); }
fwrite(STDERR, "Senha inicial pela entrada padrão (não use argumento de linha de comando):\n");
$password = rtrim(fgets(STDIN) ?: '', "\r\n");
if (strlen($password) < 12 || strlen($password) > 72) { fwrite(STDERR, "Use entre 12 e 72 bytes.\n"); exit(1); }
try {
    $db = connectDb(readConfig()); $db->beginTransaction();
    if (query($db, 'SELECT id FROM public.crm_users WHERE lower(email)=?', [$email])->fetch()) throw new RuntimeException('Usuário já existe. Importe ou use a administração para alterar suas permissões.');
    $id = uuid();
    query($db, 'INSERT INTO public.crm_users(id,email,password_hash,email_confirmed_at) VALUES(?,?,?,now())', [$id, $email, password_hash($password, PASSWORD_DEFAULT)]);
    query($db, 'INSERT INTO public.crm_profiles(id,email,role) VALUES(?,?,\'admin\')', [$id, $email]);
    $db->commit(); echo "Administrador de validação criado. UUID: " . $id . "\n";
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, "Não foi possível criar o administrador. Confira configuração, duplicidade e logs privados.\n"); exit(1);
}
