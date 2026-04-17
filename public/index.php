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

echo 'Translation tool backend is running';