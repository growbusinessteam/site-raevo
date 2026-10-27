<?php
declare(strict_types=1);

function leadsRoot(): string {
    $root = getenv('RAEVO_PRIVATE_PATH') ?: dirname(rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 3)), '/\\')) . '/raevo-private';
    $public = realpath($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 3));
    if (!is_dir($root) && !mkdir($root, 0700, true) && !is_dir($root)) throw new RuntimeException('storage_unavailable');
    $resolved = realpath($root);
    if (!$resolved || ($public && str_starts_with(strtolower(str_replace('\\', '/', $resolved)) . '/', strtolower(str_replace('\\', '/', $public)) . '/'))) throw new RuntimeException('storage_must_be_private');
    return $resolved;
}
function leadsDir(): string {
    $dir = leadsRoot() . '/leads';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) throw new RuntimeException('storage_unavailable');
    return $dir;
}
function leadsRead(string $path): array {
    if (!is_file($path)) return [];
    $data = json_decode((string)file_get_contents($path), true);
    if (!is_array($data)) throw new RuntimeException('invalid_stored_record');
    return $data;
}
function leadsWrite(string $path, array $data): void {
    $temp = $path . '.' . bin2hex(random_bytes(8)) . '.tmp';
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    if (file_put_contents($temp, $json, LOCK_EX) !== strlen($json)) throw new RuntimeException('storage_failed');
    chmod($temp, 0600);
    if (!rename($temp, $path)) throw new RuntimeException('storage_failed');
}
function leadsJson(int $status, array $data): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function leadsBody(int $max = 65536): array {
    $raw = file_get_contents('php://input', false, null, 0, $max + 1);
    if (strlen((string)$raw) > $max) leadsJson(413, ['message' => 'Envio muito grande.']);
    try { $data = json_decode((string)$raw, true, 32, JSON_THROW_ON_ERROR); }
    catch (Throwable) { leadsJson(400, ['message' => 'Dados inválidos.']); }
    if (!is_array($data) || array_is_list($data)) leadsJson(400, ['message' => 'Dados inválidos.']);
    return $data;
}
function leadsOrigin(): bool {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['https://raevo.io', 'https://www.raevo.io'];
    if (getenv('RAEVO_TEST_ORIGIN')) $allowed[] = getenv('RAEVO_TEST_ORIGIN');
    return in_array($origin, $allowed, true);
}
function leadsRate(string $scope, int $max, int $window): void {
    $path = leadsDir() . '/rate-' . hash('sha256', $scope . ($_SERVER['REMOTE_ADDR'] ?? 'unknown')) . '.json';
    $lock = fopen($path . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('rate_lock_failed');
    $rate = leadsRead($path);
    if (($rate['at'] ?? 0) < time() - $window) $rate = ['at' => time(), 'count' => 0];
    if (($rate['count'] ?? 0) >= $max) { header('Retry-After: ' . $window); leadsJson(429, ['message' => 'Muitas tentativas. Aguarde alguns minutos.']); }
    $rate['count'] = ($rate['count'] ?? 0) + 1;
    leadsWrite($path, $rate);
    flock($lock, LOCK_UN); fclose($lock);
}
function leadsNormalize(array $payload, string $id, string $receivedAt): array {
    $values = is_array($payload['values'] ?? null) ? $payload['values'] : $payload;
    $person = is_array($payload['person'] ?? null) ? $payload['person'] : [];
    $contact = is_array($payload['contact'] ?? null) ? $payload['contact'] : [];
    $attribution = $payload['attribution'] ?? $payload['utm'] ?? [];
    return [
        'id' => $id, 'received_at' => $receivedAt,
        'submitted_at' => $payload['submittedAt'] ?? $payload['captured_at'] ?? $receivedAt,
        'name' => (string)($person['name'] ?? $values['fullName'] ?? $values['name'] ?? $values['nome'] ?? $contact['nome'] ?? ''),
        'phone' => (string)($person['whatsapp'] ?? $values['whatsapp'] ?? $values['phone'] ?? $values['telefone'] ?? $contact['telefone'] ?? ''),
        'email' => (string)($person['email'] ?? $values['email'] ?? ''),
        'page' => (string)($payload['sourceUrl'] ?? $values['pageUrl'] ?? $payload['_page'] ?? $attribution['landing_page'] ?? ''),
        'source' => (string)($payload['source'] ?? $payload['locale'] ?? 'site'),
        'attribution' => is_array($attribution) ? $attribution : [],
        'payload' => $payload, 'delivery' => 'pending', 'crm_status' => 'unverified', 'origin' => 'site',
    ];
}
function leadsAll(): array {
    $records = [];
    foreach (glob(leadsDir() . '/lead-*.json') ?: [] as $path) {
        $row = leadsRead($path); if ($row) $records[$row['id']] = $row;
    }
    $maturity = getenv('MATURITY_PRIVATE_STORAGE_PATH') ?: leadsRoot() . '/maturity-results';
    foreach (glob($maturity . '/lead-*.json') ?: [] as $path) {
        $old = leadsRead($path);
        if (!isset($old['lead_id'], $old['submission'])) continue;
        $id = 'maturity-' . $old['lead_id'];
        $row = leadsNormalize($old['submission'], $id, $old['captured_at']);
        $row['page'] = '/teste-maturidade-comercial/dados-iniciais/';
        $row['delivery'] = $old['webhook'] ?? 'unknown';
        $row['completed_at'] = $old['completed_at'] ?? null;
        if (!empty($old['result_token']) && preg_match('/^[a-f0-9]{64}$/', $old['result_token'])) {
            $result = leadsRead($maturity . '/result-' . $old['result_token'] . '.json');
            if ($result) { $row['payload'] = $result['submission']; $row['assessment_result'] = $result['result']; }
        }
        $records[$id] = $row;
    }
    return array_values($records);
}
