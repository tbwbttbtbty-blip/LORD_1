<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$userMessage = $_POST['message'] ?? '';
$conversationId = $_POST['conversation_id'] ?? 'default';

if (empty($userMessage)) {
    echo json_encode(['error' => 'الرسالة فارغة']);
    exit;
}

// حفظ المحادثة في ملف
$historyFile = "history_{$conversationId}.json";
$history = [];
if (file_exists($historyFile)) {
    $history = json_decode(file_get_contents($historyFile), true) ?? [];
}

// بناء السياق
$context = "أنت LORD AI — مساعد ذكي متطور، مطورك عبدالله (LORD)، عمره 19 سنة. ";
$context .= "أنت متخصص في الأمن السيبراني، البرمجة، والذكاء الاصطناعي. ";
$context .= "ترد باللغة العربية، تفصيلاً، وبأكواد عملية.\n\n";

foreach ($history as $msg) {
    $role = $msg['role'] === 'user' ? 'مستخدم' : 'مساعد';
    $context .= "{$role}: {$msg['text']}\n";
}
$context .= "مستخدم: {$userMessage}\nمساعد:";

// استدعاء Ollama
$ollamaInput = json_encode([
    'model' => 'deepseek-r1:8b',
    'prompt' => $context,
    'stream' => false,
    'options' => [
        'temperature' => 0.7,
        'top_p' => 0.9,
        'max_tokens' => 4096,
    ]
]);

$ch = curl_init('http://localhost:11434/api/generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $ollamaInput);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$aiReply = $data['response'] ?? 'عذراً، حدث خطأ';

// حفظ المحادثة
$history[] = ['role' => 'user', 'text' => $userMessage];
$history[] = ['role' => 'assistant', 'text' => $aiReply];
file_put_contents($historyFile, json_encode($history));

echo json_encode([
    'reply' => $aiReply,
    'conversation_id' => $conversationId
]);