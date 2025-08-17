<?php
session_start();

// 檢查是否已登入
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    // 已登入，直接跳轉到後台首頁
    header('Location: index.html');
    exit();
}

// 處理登請求
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 獲取登入信息
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $token = isset($_POST['token']) ? $_POST['token'] : '';

    // 引入數據庫配置
    require_once 'config/database.php';

    // 處理令牌登入（記住我功能）
    if (!empty($token)) {
        try {
            $conn = getDbConnection();

            // 查詢符合令牌的管理員帳號
            $stmt = $conn->prepare("SELECT * FROM admin_users WHERE remember_token = ? AND datetime(token_expiry) > datetime('now')");
            $stmt->execute([$token]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($admin) {
                // 令牌有效，設置會話
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_username'] = $admin['username'];
                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_name'] = $admin['name'];

                // 更新最後登入時間
                $stmt = $conn->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
                $stmt->execute([$admin['id']]);

                // 返回JSON響應
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => '登入成功'
                ]);
                exit();
            } else {
                // 令牌無效或已過期
                header('Content-Type: application/json');
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => '登入已過期，請重新登入'
                ]);
                exit();
            }
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '數據庫錯誤: ' . $e->getMessage()
            ]);
            exit();
        }
    }

    // 處理常規用戶名密碼登入
    if (empty($username) || empty($password)) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '用戶名和密碼不能為空'
        ]);
        exit();
    }

    try {
        $conn = getDbConnection();

        // 查詢管理員帳號
        $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($password, $admin['password'])) {
            // 驗證成功，設置會話
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_name'] = $admin['name'];

            // 如果選擇了記住我，設置長期cookie
            if (isset($_POST['rememberMe']) && $_POST['rememberMe'] === 'on') {
                // 生成一個令牌
                $token = bin2hex(random_bytes(32));
                $token_expiry = date('Y-m-d H:i:s', strtotime('+30 days'));

                // 保存令牌到數據庫
                $stmt = $conn->prepare("UPDATE admin_users SET remember_token = ?, token_expiry = ? WHERE id = ?");
                $stmt->execute([$token, $token_expiry, $admin['id']]);

                // 設置cookie
                setcookie('admin_remember', $token, time() + (86400 * 30), "/"); // 30天有效期
            }

            // 返回JSON響應
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => '登入成功'
            ]);
            exit();
        } else {
            // 驗證失敗
            header('Content-Type: application/json');
            http_response_code(401);
            $errorDetails = [
                'success' => false,
                'message' => '用戶名或密碼錯誤',
                'username_provided' => $username,
                'admin_exists' => !empty($admin),
                'password_match' => $admin ? password_verify($password, $admin['password']) : false
            ];
            echo json_encode($errorDetails);
            error_log("登入失敗: 用戶名=" . $username . ", 管理員存在=" . (!empty($admin) ? '是' : '否'));
            exit();
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        http_response_code(500);
        $errorDetails = [
            'success' => false,
            'message' => '數據庫錯誤: ' . $e->getMessage(),
            'error_type' => 'PDOException',
            'error_code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
        echo json_encode($errorDetails);
        error_log("登入數據庫錯誤: " . $e->getMessage());
        exit();
    }
}

// 如果不是POST請求，返回登入頁面
header('Location: login.html');
exit();
