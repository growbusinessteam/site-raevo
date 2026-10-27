<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/api/leads/storage.php';
try {
    header('Cache-Control: no-store, private');
    header('X-Robots-Tag: noindex, nofollow');
    ini_set('session.use_strict_mode', '1');
    session_name('raevo_admin');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/admin', 'secure' => ($_SERVER['HTTPS'] ?? '') === 'on', 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    $configPath = leadsRoot() . '/admin-access.json';
    $config = leadsRead($configPath);
    if (!$config) {
        $lock = fopen($configPath . '.lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('setup_lock_failed');
        $config = leadsRead($configPath);
        if (!$config) {
            $password = bin2hex(random_bytes(16));
            $config = ['username' => 'admin', 'password_hash' => password_hash($password, PASSWORD_DEFAULT)];
            leadsWrite($configPath, $config);
            $accessPath = leadsRoot() . '/admin-first-access.txt';
            file_put_contents($accessPath, "Raevo Admin\nhttps://raevo.io/admin/\nUsuário: admin\nSenha: " . $password . "\nArquivo privado. Não publicar nem versionar.\n", LOCK_EX);
            chmod($accessPath, 0600);
            // Only the installation owner's local private key can open this envelope.
            // No password or private key is shipped in Git or returned in clear text.
            if (function_exists('openssl_public_encrypt') && is_file(__DIR__ . '/bootstrap-public.pem')) {
                $sealed = '';
                if (openssl_public_encrypt($password, $sealed, file_get_contents(__DIR__ . '/bootstrap-public.pem'), OPENSSL_PKCS1_OAEP_PADDING)) {
                    leadsWrite(leadsRoot() . '/admin-bootstrap.json', ['sealed' => base64_encode($sealed)]);
                }
            }
        }
        flock($lock, LOCK_UN); fclose($lock);
    }
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? 'session';
    if ($method === 'GET' && $action === 'session') leadsJson(200, ['authenticated' => !empty($_SESSION['authenticated']) && ($_SESSION['expires'] ?? 0) > time(), 'csrf' => $_SESSION['csrf']] + leadsRead(leadsRoot() . '/admin-bootstrap.json'));
    if ($method === 'POST') {
        if (!leadsOrigin()) leadsJson(403, ['message' => 'Origem não permitida.']);
        if (!hash_equals($_SESSION['csrf'], (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))) leadsJson(403, ['message' => 'Recarregue a página.']);
        if ($action === 'login') {
            leadsRate('login', 8, 900); $data = leadsBody(4096);
            if (!is_string($data['password'] ?? null) || !is_string($data['username'] ?? null) || !hash_equals($config['username'], $data['username']) || !password_verify($data['password'], $config['password_hash'])) leadsJson(401, ['message' => 'Usuário ou senha inválidos.']);
            session_regenerate_id(true); $_SESSION['authenticated'] = true; $_SESSION['expires'] = time() + 28800;
            if (is_file(leadsRoot() . '/admin-bootstrap.json')) unlink(leadsRoot() . '/admin-bootstrap.json');
            $_SESSION['csrf'] = bin2hex(random_bytes(32)); leadsJson(200, ['authenticated' => true, 'csrf' => $_SESSION['csrf']]);
        }
    }
    if (empty($_SESSION['authenticated']) || ($_SESSION['expires'] ?? 0) <= time()) leadsJson(401, ['message' => 'Entre para acessar os leads.']);
    if ($method === 'POST' && $action === 'logout') { $_SESSION = []; session_destroy(); leadsJson(200, ['ok' => true]); }
    if ($method === 'POST' && $action === 'import') {
        $data = leadsBody(8000000);
        if (!in_array($data['kind'] ?? '', ['crm', 'history'], true) || !is_array($data['records'] ?? null) || count($data['records']) > 2000) leadsJson(422, ['message' => 'Arquivo de importação inválido.']);
        $imported = 0;
        foreach ($data['records'] as $record) {
            if (!is_array($record) || !is_string($record['id'] ?? null) || !preg_match('/^[a-zA-Z0-9_-]{1,120}$/', $record['id']) || !is_string($record['received_at'] ?? null) || strtotime($record['received_at']) === false) leadsJson(422, ['message' => 'Registro de importação inválido.']);
        }
        foreach ($data['records'] as $record) {
            $record['origin'] = $data['kind'] === 'crm' ? 'crm' : 'history';
            $record['imported_at'] = gmdate(DATE_ATOM);
            $path = leadsDir() . '/lead-' . hash('sha256', $record['id']) . '.json';
            leadsWrite($path, $record); $imported++;
        }
        leadsWrite(leadsDir() . '/last-import-' . $data['kind'] . '.json', ['at' => gmdate(DATE_ATOM), 'records' => $imported, 'from' => $data['from'] ?? null, 'to' => $data['to'] ?? null]);
        leadsJson(200, ['imported' => $imported]);
    }
    if ($method === 'GET' && $action === 'leads') {
        $fromDate = (string)($_GET['from'] ?? date('Y-m-d', time() - 29 * 86400));
        $toDate = (string)($_GET['to'] ?? date('Y-m-d'));
        $tz = new DateTimeZone('America/Bahia');
        $from = DateTimeImmutable::createFromFormat('!Y-m-d', $fromDate, $tz);
        $to = DateTimeImmutable::createFromFormat('!Y-m-d', $toDate, $tz);
        if (!$from || !$to || $from->format('Y-m-d') !== $fromDate || $to->format('Y-m-d') !== $toDate || $from > $to) leadsJson(422, ['message' => 'Confira o período.']);
        $all = leadsAll(); $crm = array_values(array_filter($all, fn($r) => ($r['origin'] ?? '') === 'crm'));
        foreach ($all as &$row) {
            if (($row['origin'] ?? '') === 'crm') { $row['crm_status'] = 'crm_only'; continue; }
            $phone = preg_replace('/\D/', '', $row['phone'] ?? '');
            $email = strtolower(trim($row['email'] ?? ''));
            $matches = array_values(array_filter($crm, function($r) use ($row, $phone, $email) {
                if (in_array($row['id'], $r['submission_ids'] ?? [], true)) return true;
                return ($phone !== '' && in_array($phone, $r['phones'] ?? [], true)) || ($email !== '' && in_array($email, $r['emails'] ?? [], true));
            }));
            // Phone/e-mail finds a candidate; only an explicit submission ID confirms delivery.
            if ($matches) {
                $exact = array_values(array_filter($matches, fn($r) => in_array($row['id'], $r['submission_ids'] ?? [], true)));
                $row['crm_status'] = $exact ? 'confirmed' : 'candidate';
                $row['crm_matches'] = array_map(fn($r) => ['id' => $r['crm_id'], 'name' => $r['name'], 'url' => $r['crm_url'], 'received_at' => $r['received_at']], $exact ?: $matches);
            }
        } unset($row);
        $rows = array_values(array_filter($all, fn($r) => ($at = strtotime($r['received_at'] ?? '')) !== false && $at >= $from->getTimestamp() && $at < $to->modify('+1 day')->getTimestamp()));
        usort($rows, fn($a, $b) => strcmp($b['received_at'], $a['received_at']));
        leadsJson(200, ['records' => $rows, 'from' => $fromDate, 'to' => $toDate, 'timezone' => 'America/Bahia', 'crm_import' => leadsRead(leadsDir() . '/last-import-crm.json'), 'history_import' => leadsRead(leadsDir() . '/last-import-history.json')]);
    }
    leadsJson(405, ['message' => 'Ação não permitida.']);
} catch (Throwable $error) { error_log('Raevo admin: ' . $error->getMessage()); leadsJson(503, ['message' => 'Não foi possível consultar os dados agora.']); }
