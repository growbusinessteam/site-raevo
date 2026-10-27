<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') leadsJson(405, ['message' => 'Use POST.']);
    if (!leadsOrigin()) leadsJson(403, ['message' => 'Abra o formulário no site da Raevo.']);
    leadsRate('capture', 40, 3600);
    $payload = leadsBody();
    $id = $payload['id'] ?? $payload['submission_id'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-zA-Z0-9_-]{8,100}$/', $id)) leadsJson(422, ['message' => 'Identificador inválido.']);
    $row = leadsNormalize($payload, $id, gmdate(DATE_ATOM));
    if (trim($row['name']) === '' || (strlen(preg_replace('/\D/', '', $row['phone'])) < 9 && !filter_var($row['email'], FILTER_VALIDATE_EMAIL))) leadsJson(422, ['message' => 'Confira o nome e os dados de contato.']);
    $path = leadsDir() . '/lead-' . hash('sha256', $id) . '.json';
    $lock = fopen($path . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('lock_failed');
    $existing = leadsRead($path);
    if ($existing) {
        if (hash('sha256', json_encode($existing['payload'])) !== hash('sha256', json_encode($payload))) leadsJson(409, ['message' => 'Este envio já foi registrado com outros dados.']);
        leadsJson(200, ['accepted' => true, 'id' => $id, 'delivery' => $existing['delivery']]);
    }
    leadsWrite($path, $row);
    // Persist before forwarding. A webhook acknowledgement is never CRM confirmation.
    $row['delivery'] = 'not_configured';
    $url = getenv('RAEVO_LEADS_WEBHOOK_URL') ?: 'https://hook.growautomacao.com.br/webhook/raevo-site-kommo';
    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Idempotency-Key: ' . $id], CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE), CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 12, CURLOPT_FOLLOWLOCATION => false]);
        $raw = curl_exec($handle); $status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE); $error = curl_errno($handle); curl_close($handle);
        $response = is_string($raw) ? json_decode($raw, true) : null;
        $rejected = is_array($response) && (($response['ok'] ?? null) === false || ($response['success'] ?? null) === false || !empty($response['error']));
        $row['delivery'] = !$error && !$rejected && $status >= 200 && $status < 300 ? 'sent' : 'failed';
        $row['delivery_http_status'] = $status; $row['delivery_at'] = gmdate(DATE_ATOM);
    }
    leadsWrite($path, $row);
    leadsJson(201, ['accepted' => true, 'id' => $id, 'delivery' => $row['delivery']]);
} catch (Throwable $error) { error_log('Raevo lead capture: ' . $error->getMessage()); leadsJson(503, ['message' => 'Não foi possível guardar os dados. Tente novamente.']); }
