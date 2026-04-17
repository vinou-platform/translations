<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

function jsonResponse($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function getResourcesDir(): string
{
    $dir = realpath(__DIR__ . '/../Resources');
    if ($dir === false) {
        jsonResponse(['error' => 'Resources directory not found'], 500);
    }
    return $dir;
}

if ($path === '/api/translations') {
    $resourcesDir = getResourcesDir();
    $files = ['de', 'en', 'es', 'fr', 'it'];
    $result = [];

    foreach ($files as $lang) {
        $filePath = $resourcesDir . DIRECTORY_SEPARATOR . $lang . '.json';
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $result[$lang] = $decoded;
            }
        }
    }

    jsonResponse($result);
}

if (preg_match('#^/api/translations/([a-z]{2})$#', $path, $matches)) {
    $lang = $matches[1];
    $resourcesDir = getResourcesDir();
    $filePath = $resourcesDir . DIRECTORY_SEPARATOR . $lang . '.json';

    if (!file_exists($filePath)) {
        jsonResponse(['error' => 'Language file not found'], 404);
    }

    $content = file_get_contents($filePath);
    $decoded = json_decode($content, true);

    if (!is_array($decoded)) {
        jsonResponse(['error' => 'Invalid JSON file'], 500);
    }

    jsonResponse($decoded);
}

if ($path === '/api/save-translation' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $lang = $input['lang'] ?? null;
    $data = $input['data'] ?? null;

    if (!is_string($lang) || !preg_match('/^[a-z]{2}$/', $lang)) {
        jsonResponse(['error' => 'Invalid language code'], 400);
    }

    if (!is_array($data)) {
        jsonResponse(['error' => 'Invalid translation payload'], 400);
    }

    $resourcesDir = getResourcesDir();
    $filePath = $resourcesDir . DIRECTORY_SEPARATOR . $lang . '.json';

    $json = json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        jsonResponse(['error' => 'JSON encoding failed'], 500);
    }

    $jsonWithTabs = preg_replace_callback(
        '/^(    )+/m',
        function ($matches) {
            return str_repeat("\t", strlen($matches[0]) / 4);
        },
        $json
    );

    file_put_contents($filePath, $jsonWithTabs);

    jsonResponse(['success' => true]);
}

if ($path === '/api/translate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $apiKey = $input['apiKey'] ?? null;
    $text = $input['text'] ?? null;
    $targetLang = $input['targetLang'] ?? null;
    $sourceLang = $input['sourceLang'] ?? null;

    if (!is_string($apiKey) || trim($apiKey) === '') {
        jsonResponse(['error' => 'Missing DeepL API key'], 400);
    }

    if (!is_string($text)) {
        jsonResponse(['error' => 'Missing text'], 400);
    }

    if (!is_string($targetLang) || trim($targetLang) === '') {
        jsonResponse(['error' => 'Missing target language'], 400);
    }

    $payload = [
        'text' => [$text],
        'target_lang' => strtoupper($targetLang),
    ];

    if (is_string($sourceLang) && trim($sourceLang) !== '') {
        $payload['source_lang'] = strtoupper($sourceLang);
    }

    $ch = curl_init('https://api.deepl.com/v2/translate');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: DeepL-Auth-Key ' . trim($apiKey),
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($result === false) {
        jsonResponse(['error' => 'DeepL request failed: ' . $curlError], 500);
    }

    $decoded = json_decode($result, true);

    if ($httpCode >= 400) {
        $message = $decoded['message'] ?? 'DeepL request failed';
        jsonResponse(['error' => $message], $httpCode);
    }

    $translation = $decoded['translations'][0]['text'] ?? null;

    if (!is_string($translation)) {
        jsonResponse(['error' => 'Invalid DeepL response'], 500);
    }

    jsonResponse(['translation' => $translation]);
}

echo 'Translation tool backend is running';