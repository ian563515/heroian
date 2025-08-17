<?php
// 設置響應頭為 JSON
header('Content-Type: application/json');

// 檢查是否為 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
    exit();
}

// 獲取並清理輸入數據
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// 驗證必填欄位
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '所有欄位都是必填的']);
    exit();
}

// 驗證電子郵件格式
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '電子郵件格式不正確']);
    exit();
}

// 在實際應用中，這裡應該將數據保存到數據庫
// 模擬保存聯絡資訊
$contactData = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'date' => date('Y-m-d H:i:s')
];

// 模擬保存到數據庫（實際應用中應使用真實的數據庫操作）
// $success = saveToDatabase($contactData);

// 模擬發送通知郵件（實際應用中應使用 PHPMailer 或其他郵件庫）
// $emailSent = sendNotificationEmail($contactData);

// 模擬成功處理
$success = true;
$emailSent = true;

if ($success) {
    // 可選：發送確認郵件給訪客
    if ($emailSent) {
        echo json_encode([
            'success' => true, 
            'message' => '感謝您的留言，我們已收到並會盡快回覆！'
        ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => '您的留言已成功提交，但我們無法發送確認郵件。'
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '提交失敗，請稍後再試。']);
}

// 在實際應用中，您需要實現以下函數：

// function saveToDatabase($data) {
//     // 將聯絡資訊保存到數據庫
//     // 返回保存是否成功
// }

// function sendNotificationEmail($data) {
//     // 發送通知郵件給管理員
//     // 返回郵件是否發送成功
// }
?>