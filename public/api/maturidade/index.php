<?php
declare(strict_types=1);

const MAX_BODY_BYTES = 1048576;
const MAX_POINTS = 72;

function jsonResponse(int $status, array $payload): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, private');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function cleanText(mixed $value, int $max = 240): string {
    $text = trim((string)($value ?? ''));
    return function_exists('mb_substr')
        ? mb_substr($text, 0, $max, 'UTF-8')
        : substr($text, 0, $max);
}

function readJsonBody(): array {
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length <= 0 || $length > MAX_BODY_BYTES) jsonResponse(413, ['code' => 'body_size', 'message' => 'O pedido excede o tamanho permitido.']);
    $raw = file_get_contents('php://input');
    try { $payload = json_decode((string)$raw, true, 64, JSON_THROW_ON_ERROR); }
    catch (JsonException) { jsonResponse(400, ['code' => 'invalid_json', 'message' => 'O pedido não contém dados válidos.']); }
    if (!is_array($payload)) jsonResponse(400, ['code' => 'invalid_payload', 'message' => 'O pedido não contém dados válidos.']);
    return $payload;
}

function storageDirectory(): string {
    $configured = getenv('MATURITY_PRIVATE_STORAGE_PATH');
    $documentRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 3)), '/');
    $path = $configured !== false && trim($configured) !== ''
        ? rtrim($configured, '/')
        : dirname($documentRoot) . '/raevo-private/maturity-results';
    if (!is_dir($path) && !mkdir($path, 0700, true) && !is_dir($path)) {
        jsonResponse(503, ['code' => 'storage_unavailable', 'message' => 'Não foi possível preparar o resultado agora. Tente novamente.']);
    }
    return $path;
}

function atomicWrite(string $path, array $payload): void {
    $temporary = $path . '.' . bin2hex(random_bytes(8)) . '.tmp';
    $handle = fopen($temporary, 'x+b');
    if ($handle === false) throw new RuntimeException('temporary_file_failed');
    try {
        if (!flock($handle, LOCK_EX)) throw new RuntimeException('lock_failed');
        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        if (fwrite($handle, $encoded) === false) throw new RuntimeException('write_failed');
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('rename_failed');
    }
    @chmod($path, 0600);
}

function uuidV4(): string {
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function levels(): array {
    return [
        ['key' => 'initial', 'label' => 'Inicial', 'min' => 0, 'max' => 20, 'description' => 'O comercial depende principalmente das pessoas e não de um processo definido.'],
        ['key' => 'reactive', 'label' => 'Reativo', 'min' => 21, 'max' => 40, 'description' => 'Existem algumas práticas, mas a empresa atua conforme os problemas aparecem.'],
        ['key' => 'structured', 'label' => 'Estruturado', 'min' => 41, 'max' => 60, 'description' => 'Já existem processos, ferramentas e responsabilidades, embora ainda haja inconsistências.'],
        ['key' => 'predictable', 'label' => 'Previsível', 'min' => 61, 'max' => 80, 'description' => 'A empresa acompanha indicadores, conhece as conversões e consegue antecipar resultados.'],
        ['key' => 'intelligent', 'label' => 'Inteligente', 'min' => 81, 'max' => 100, 'description' => 'Dados, automação e inteligência ajudam a empresa a tomar decisões e melhorar continuamente.'],
    ];
}

function classifyPercentage(int $percentage): array {
    foreach (levels() as $level) {
        if ($percentage >= $level['min'] && $percentage <= $level['max']) return $level;
    }
    throw new InvalidArgumentException('percentage_out_of_range');
}

function pillarDefinitions(): array {
    return [
        ['key' => 'opportunities', 'label' => 'Geração de oportunidades'],
        ['key' => 'service', 'label' => 'Atendimento e qualificação'],
        ['key' => 'process', 'label' => 'Processo comercial'],
        ['key' => 'crm_followup', 'label' => 'CRM e acompanhamento'],
        ['key' => 'data_management', 'label' => 'Dados e gestão'],
        ['key' => 'automation_intelligence', 'label' => 'Automação e inteligência'],
    ];
}

function calculateResult(array $answers): array {
    if (count($answers) !== 18) throw new InvalidArgumentException('answers_count');
    usort($answers, fn(array $left, array $right): int => $left['question'] <=> $right['question']);
    $scores = [];
    foreach ($answers as $index => $answer) {
        $question = filter_var($answer['question'] ?? null, FILTER_VALIDATE_INT);
        $score = filter_var($answer['score'] ?? null, FILTER_VALIDATE_INT);
        if ($question !== $index + 1 || $score === false || $score < 0 || $score > 4) throw new InvalidArgumentException('answers_invalid');
        $scores[] = $score;
    }
    $pillars = [];
    foreach (pillarDefinitions() as $index => $definition) {
        $points = array_sum(array_slice($scores, $index * 3, 3));
        $pillars[] = $definition + ['points' => $points, 'max_points' => 12, 'percentage' => (int)round(($points / 12) * 100), 'order' => $index];
    }
    $total = array_sum($scores);
    $percentage = (int)round(($total / MAX_POINTS) * 100);
    $ascending = $pillars;
    usort($ascending, fn(array $left, array $right): int => ($left['percentage'] <=> $right['percentage']) ?: ($left['order'] <=> $right['order']));
    $descending = $pillars;
    usort($descending, fn(array $left, array $right): int => ($right['percentage'] <=> $left['percentage']) ?: ($left['order'] <=> $right['order']));
    foreach ($pillars as &$pillar) unset($pillar['order']);
    foreach ($ascending as &$pillar) unset($pillar['order']);
    foreach ($descending as &$pillar) unset($pillar['order']);
    return [
        'total_points' => $total,
        'max_points' => MAX_POINTS,
        'percentage' => $percentage,
        'level' => classifyPercentage($percentage),
        'pillars' => $pillars,
        'strongest_pillar' => $descending[0],
        'weakest_pillar' => $ascending[0],
        'ranked_ascending' => $ascending,
    ];
}

function insightLibrary(): array {
    return [
        'initial' => ['insight' => 'A operação comercial ainda depende principalmente do esforço individual das pessoas. A ausência de processos claros dificulta o acompanhamento das oportunidades e torna os resultados pouco previsíveis.', 'next_step' => 'O primeiro passo não é automatizar. É definir a jornada, as responsabilidades e a forma como cada oportunidade deve ser acompanhada.', 'risk' => 'O crescimento aumenta a dependência de memória, esforço individual e decisões sem contexto.'],
        'reactive' => ['insight' => 'A empresa já possui algumas práticas e ferramentas, mas a operação ainda reage aos acontecimentos conforme eles surgem.', 'next_step' => 'O próximo passo é substituir ações isoladas por um processo comercial consistente, utilizado por toda a equipa.', 'risk' => 'Práticas isoladas perdem força quando o volume cresce ou as responsabilidades mudam.'],
        'structured' => ['insight' => 'A empresa já possui parte importante da estrutura necessária, mas ainda existem falhas de utilização, integração ou acompanhamento.', 'next_step' => 'O próximo salto depende de tornar o processo consistente, mensurável e menos dependente de esforço individual.', 'risk' => 'A estrutura existe, mas as inconsistências impedem que ela produza previsibilidade.'],
        'predictable' => ['insight' => 'A empresa já acompanha boa parte do processo e possui capacidade de antecipar resultados.', 'next_step' => 'A próxima evolução está na utilização mais inteligente dos dados, na integração dos sistemas e na melhoria contínua da operação.', 'risk' => 'Sistemas desconectados e decisões tardias podem limitar a eficiência alcançada.'],
        'intelligent' => ['insight' => 'A empresa possui um sistema comercial avançado, apoiado por processos, dados e tecnologia.', 'next_step' => 'O desafio passa a ser melhorar continuamente a eficiência, identificar novas oportunidades e impedir que a complexidade reduza a consistência.', 'risk' => 'A complexidade pode crescer mais depressa do que a capacidade de manter o sistema consistente.'],
    ];
}

function recommendationLibrary(): array {
    return [
        'opportunities' => ['title' => 'Dar visibilidade à origem e à qualidade', 'body' => 'Centralizar a origem das oportunidades, definir critérios de qualidade e acompanhar a diferença entre volume gerado e oportunidades realmente qualificadas.', 'outcome' => 'Investimento comercial orientado pela qualidade das oportunidades.'],
        'service' => ['title' => 'Estruturar resposta e qualificação', 'body' => 'Definir prazos de resposta, padronizar a abordagem inicial e estabelecer critérios claros de qualificação.', 'outcome' => 'Atendimento mais rápido, consistente e preparado para priorizar.'],
        'process' => ['title' => 'Desenhar a jornada comercial', 'body' => 'Desenhar a jornada completa, definir critérios de avanço e atribuir responsabilidades para cada etapa.', 'outcome' => 'Cada oportunidade avança com um próximo passo e um responsável claro.'],
        'crm_followup' => ['title' => 'Centralizar acompanhamento no CRM', 'body' => 'Centralizar as oportunidades no CRM e criar uma sequência consistente de tarefas, follow-ups e reativação.', 'outcome' => 'Menos oportunidades esquecidas e mais continuidade comercial.'],
        'data_management' => ['title' => 'Criar uma rotina de gestão', 'body' => 'Definir indicadores essenciais, padronizar os motivos de perda e criar uma rotina periódica de análise e decisão.', 'outcome' => 'Decisões comerciais apoiadas por dados comparáveis.'],
        'automation_intelligence' => ['title' => 'Automatizar processos já validados', 'body' => 'Organizar os processos antes de automatizar e integrar progressivamente as tarefas que já possuem uma lógica validada.', 'outcome' => 'Mais eficiência sem automatizar desorganização.'],
    ];
}

function buildPriorities(array $result): array {
    $recommendations = recommendationLibrary();
    $first = $result['ranked_ascending'][0];
    $second = $result['ranked_ascending'][1];
    $levelInsight = insightLibrary()[$result['level']['key']];
    return [
        ['number' => 1, 'pillar' => $first['label']] + $recommendations[$first['key']],
        ['number' => 2, 'pillar' => $second['label']] + $recommendations[$second['key']],
        ['number' => 3, 'pillar' => null, 'title' => 'Preparar o próximo nível de maturidade', 'body' => $levelInsight['next_step'], 'outcome' => 'Uma evolução sustentada para além de ações isoladas.'],
    ];
}

function validateLeadCapture(array $payload): array {
    $person = is_array($payload['person'] ?? null) ? $payload['person'] : [];
    $company = is_array($payload['company'] ?? null) ? $payload['company'] : [];
    $consent = is_array($payload['consent'] ?? null) ? $payload['consent'] : [];
    $name = cleanText($person['name'] ?? '', 120);
    $whatsapp = preg_replace('/\D+/', '', cleanText($person['whatsapp'] ?? '', 40));
    $sector = cleanText($company['sector'] ?? '', 120);
    if ($name === '') throw new InvalidArgumentException('name_required');
    if (strlen($whatsapp) < 9) throw new InvalidArgumentException('phone_invalid');
    if ($sector === '') throw new InvalidArgumentException('sector_required');
    if (($consent['privacy_notice_shown'] ?? false) !== true) throw new InvalidArgumentException('privacy_notice_required');
    return [
        'source' => 'teste_maturidade_comercial',
        'person' => ['name' => $name, 'whatsapp' => '+' . $whatsapp],
        'company' => ['sector' => $sector],
        'attribution' => is_array($payload['attribution'] ?? null) ? array_map(fn($value) => cleanText($value, 500), $payload['attribution']) : [],
        'consent' => [
            'privacy_notice_shown' => true,
            'policy_url' => '/privacidade/',
            'acknowledged_at' => cleanText($consent['acknowledged_at'] ?? gmdate(DATE_ATOM), 40),
        ],
    ];
}

function attachLeadToSubmission(array $payload, string $storage): array {
    $leadId = strtolower(cleanText($payload['lead_id'] ?? '', 36));
    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $leadId) !== 1) throw new InvalidArgumentException('lead_invalid');
    $leadPath = $storage . '/lead-' . $leadId . '.json';
    if (!is_file($leadPath)) throw new InvalidArgumentException('lead_not_found');
    $leadRecord = json_decode((string)file_get_contents($leadPath), true);
    $leadSubmission = is_array($leadRecord['submission'] ?? null) ? $leadRecord['submission'] : null;
    if (!is_array($leadRecord) || !is_array($leadSubmission)) throw new InvalidArgumentException('lead_unavailable');
    $payload['lead_id'] = $leadId;
    $payload['person'] = is_array($payload['person'] ?? null) ? $payload['person'] : [];
    $payload['company'] = is_array($payload['company'] ?? null) ? $payload['company'] : [];
    $payload['person']['name'] = $leadSubmission['person']['name'];
    $payload['person']['whatsapp'] = $leadSubmission['person']['whatsapp'];
    $payload['company']['sector'] = $leadSubmission['company']['sector'];
    return [$payload, $leadPath, $leadRecord];
}

function validateSubmission(array $payload): array {
    $person = is_array($payload['person'] ?? null) ? $payload['person'] : [];
    $company = is_array($payload['company'] ?? null) ? $payload['company'] : [];
    $consent = is_array($payload['consent'] ?? null) ? $payload['consent'] : [];
    $name = cleanText($person['name'] ?? '', 120);
    $email = strtolower(cleanText($person['email'] ?? '', 180));
    $whatsapp = preg_replace('/\D+/', '', cleanText($person['whatsapp'] ?? '', 40));
    $companyName = cleanText($company['name'] ?? '', 180);
    $role = cleanText($person['role'] ?? '', 80);
    $sector = cleanText($company['sector'] ?? '', 120);
    $timeline = cleanText($company['improvement_timeline'] ?? '', 80);
    if ($name === '' || $companyName === '') throw new InvalidArgumentException('required_fields');
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) throw new InvalidArgumentException('email_invalid');
    if (strlen($whatsapp) < 9) throw new InvalidArgumentException('phone_invalid');
    if ($role === '') throw new InvalidArgumentException('role_required');
    if ($sector === '') throw new InvalidArgumentException('sector_required');
    if ($timeline === '') throw new InvalidArgumentException('timeline_required');
    if (($consent['privacy_accepted'] ?? false) !== true) throw new InvalidArgumentException('privacy_required');
    $answers = is_array($payload['answers'] ?? null) ? $payload['answers'] : [];
    $result = calculateResult($answers);
    $payload['person'] = ['name' => $name, 'email' => $email, 'whatsapp' => '+' . $whatsapp, 'role' => $role];
    $payload['company'] = [
        'name' => $companyName,
        'sector' => $sector,
        'website' => cleanText($company['website'] ?? '', 240),
        'monthly_opportunities' => cleanText($company['monthly_opportunities'] ?? '', 80),
        'average_sale_value' => cleanText($company['average_sale_value'] ?? '', 80),
        'commercial_team_size' => cleanText($company['commercial_team_size'] ?? '', 80),
        'main_goal' => cleanText($company['main_goal'] ?? '', 160),
        'improvement_timeline' => $timeline,
    ];
    $payload['answers'] = $answers;
    $payload['attribution'] = is_array($payload['attribution'] ?? null) ? array_map(fn($value) => cleanText($value, 500), $payload['attribution']) : [];
    $payload['consent'] = ['privacy_accepted' => true, 'marketing_accepted' => ($consent['marketing_accepted'] ?? false) === true, 'accepted_at' => cleanText($consent['accepted_at'] ?? gmdate(DATE_ATOM), 40)];
    return [$payload, $result];
}

function checkRateLimit(string $storage): void {
    $ipHash = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $path = $storage . '/rate-' . $ipHash . '.json';
    $now = time();
    $data = is_file($path) ? json_decode((string)file_get_contents($path), true) : null;
    if (!is_array($data) || ($data['window'] ?? 0) < $now - 3600) $data = ['window' => $now, 'count' => 0];
    if (($data['count'] ?? 0) >= 30) { header('Retry-After: 3600'); jsonResponse(429, ['code' => 'rate_limited', 'message' => 'Foram realizados vários pedidos. Tente novamente mais tarde.']); }
    $data['count'] += 1;
    atomicWrite($path, $data);
}

function sendWebhook(array $payload, string $storage, string $entityId): string {
    $url = getenv('MATURITY_ASSESSMENT_WEBHOOK_URL');
    if ($url === false || trim($url) === '') return 'not_configured';
    if (!function_exists('curl_init')) return 'curl_unavailable';
    $handle = curl_init($url);
    curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 7]);
    curl_exec($handle);
    $status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
    $error = curl_errno($handle);
    curl_close($handle);
    if ($error === 0 && $status >= 200 && $status < 300) return 'sent';
    $record = ['at' => gmdate(DATE_ATOM), 'entity_id' => $entityId, 'status' => $status, 'curl_error' => $error];
    file_put_contents($storage . '/webhook-failures.log', json_encode($record) . PHP_EOL, FILE_APPEND | LOCK_EX);
    return 'failed';
}

function handleLeadCapture(): never {
    $payload = readJsonBody();
    $storage = storageDirectory();
    checkRateLimit($storage);
    $idempotency = cleanText($_SERVER['HTTP_X_IDEMPOTENCY_KEY'] ?? $payload['idempotency_key'] ?? '', 160);
    $idempotencyHash = $idempotency !== '' ? hash('sha256', $idempotency) : '';
    $mappingPath = $idempotencyHash !== '' ? $storage . '/lead-idempotency-' . $idempotencyHash . '.json' : '';
    if ($mappingPath !== '' && is_file($mappingPath)) {
        $mapping = json_decode((string)file_get_contents($mappingPath), true);
        if (is_array($mapping) && isset($mapping['lead_id'])) jsonResponse(200, ['lead_id' => $mapping['lead_id']]);
    }
    try { $submission = validateLeadCapture($payload); }
    catch (InvalidArgumentException $error) { jsonResponse(422, ['code' => $error->getMessage(), 'message' => 'Revise o nome, o WhatsApp e o setor da empresa.']); }
    $leadId = uuidV4();
    $capturedAt = gmdate(DATE_ATOM);
    $leadPath = $storage . '/lead-' . $leadId . '.json';
    $record = ['lead_id' => $leadId, 'captured_at' => $capturedAt, 'submission' => $submission, 'webhook' => 'pending'];
    try { atomicWrite($leadPath, $record); }
    catch (Throwable) { jsonResponse(503, ['code' => 'storage_failed', 'message' => 'Não foi possível guardar os dados agora. Tente novamente.']); }
    if ($mappingPath !== '') atomicWrite($mappingPath, ['lead_id' => $leadId, 'created_at' => $capturedAt]);
    $webhookPayload = array_merge($submission, ['event' => 'maturity_lead_captured', 'lead_id' => $leadId, 'captured_at' => $capturedAt]);
    $record['webhook'] = sendWebhook($webhookPayload, $storage, $leadId);
    atomicWrite($leadPath, $record);
    jsonResponse(201, ['lead_id' => $leadId]);
}

function publicResult(array $record): array {
    return [
        'assessment_id' => $record['assessment_id'],
        'submitted_at' => $record['submitted_at'],
        'expires_at' => $record['expires_at'],
        'person' => ['name' => $record['submission']['person']['name']],
        'company' => ['name' => $record['submission']['company']['name']],
        'result' => $record['result'],
        'insight' => $record['insight'],
        'priorities' => $record['priorities'],
        'cta_url' => $record['cta_url'],
        'methodology' => 'Resultado calculado através da metodologia de maturidade comercial da Raevo.',
    ];
}

function handleSubmission(): never {
    $payload = readJsonBody();
    $storage = storageDirectory();
    checkRateLimit($storage);
    $idempotency = cleanText($_SERVER['HTTP_X_IDEMPOTENCY_KEY'] ?? $payload['idempotency_key'] ?? '', 160);
    $idempotencyHash = $idempotency !== '' ? hash('sha256', $idempotency) : '';
    $mappingPath = $idempotencyHash !== '' ? $storage . '/idempotency-' . $idempotencyHash . '.json' : '';
    if ($mappingPath !== '' && is_file($mappingPath)) {
        $mapping = json_decode((string)file_get_contents($mappingPath), true);
        if (is_array($mapping) && isset($mapping['token'])) jsonResponse(200, ['token' => $mapping['token'], 'result_url' => '/teste-maturidade-comercial/resultado/' . $mapping['token'] . '/']);
    }
    try {
        [$payload, $leadPath, $leadRecord] = attachLeadToSubmission($payload, $storage);
        [$submission, $result] = validateSubmission($payload);
    }
    catch (InvalidArgumentException $error) { jsonResponse(422, ['code' => $error->getMessage(), 'message' => 'Revise os dados e confirme que todas as perguntas foram respondidas.']); }
    $token = bin2hex(random_bytes(32));
    $assessmentId = uuidV4();
    $submittedAt = gmdate(DATE_ATOM);
    $retention = filter_var(getenv('MATURITY_RESULT_RETENTION_DAYS') ?: '180', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 3650]]) ?: 180;
    $insight = insightLibrary()[$result['level']['key']];
    $record = [
        'assessment_id' => $assessmentId,
        'submitted_at' => $submittedAt,
        'expires_at' => gmdate(DATE_ATOM, time() + ($retention * 86400)),
        'submission' => $submission,
        'result' => $result,
        'insight' => $insight + ['strongest_pillar' => $result['strongest_pillar']['label'], 'weakest_pillar' => $result['weakest_pillar']['label'], 'recommendation' => recommendationLibrary()[$result['weakest_pillar']['key']]['body']],
        'priorities' => buildPriorities($result),
        'cta_url' => getenv('MATURITY_ASSESSMENT_CTA_URL') ?: '/agendamento/',
        'webhook' => 'pending',
    ];
    try { atomicWrite($storage . '/result-' . $token . '.json', $record); }
    catch (Throwable) { jsonResponse(503, ['code' => 'storage_failed', 'message' => 'Não foi possível guardar o resultado agora. Tente novamente.']); }
    if ($mappingPath !== '') atomicWrite($mappingPath, ['token' => $token, 'created_at' => $submittedAt]);
    $webhookPayload = array_merge($submission, ['event' => 'maturity_assessment_completed', 'assessment_id' => $assessmentId, 'submitted_at' => $submittedAt, 'source' => 'teste_maturidade_comercial', 'result' => $result]);
    $record['webhook'] = sendWebhook($webhookPayload, $storage, $assessmentId);
    atomicWrite($storage . '/result-' . $token . '.json', $record);
    $leadRecord['completed_at'] = $submittedAt;
    $leadRecord['assessment_id'] = $assessmentId;
    $leadRecord['result_token'] = $token;
    atomicWrite($leadPath, $leadRecord);
    jsonResponse(201, ['token' => $token, 'result_url' => '/teste-maturidade-comercial/resultado/' . $token . '/']);
}

function handleResult(string $token): never {
    $storage = storageDirectory();
    $path = $storage . '/result-' . $token . '.json';
    if (!is_file($path)) jsonResponse(404, ['code' => 'result_not_found', 'message' => 'Este resultado não está disponível.']);
    $record = json_decode((string)file_get_contents($path), true);
    if (!is_array($record)) jsonResponse(503, ['code' => 'result_unavailable', 'message' => 'Não foi possível abrir o resultado agora.']);
    if (strtotime((string)($record['expires_at'] ?? '')) < time()) { @unlink($path); jsonResponse(410, ['code' => 'result_expired', 'message' => 'Este resultado já não está disponível. Pode realizar um novo teste.']); }
    jsonResponse(200, publicResult($record));
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$path = (string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH) ?? '');
if ($method === 'POST' && preg_match('#/api/maturidade/leads/?$#', $path)) handleLeadCapture();
if ($method === 'POST' && preg_match('#/api/maturidade/submissions/?$#', $path)) handleSubmission();
if ($method === 'GET' && preg_match('#/api/maturidade/resultado/([0-9a-f]{64})/?$#i', $path, $matches)) handleResult(strtolower($matches[1]));
header('Allow: GET, POST');
jsonResponse(405, ['code' => 'method_not_allowed', 'message' => 'Método ou rota não permitidos.']);
