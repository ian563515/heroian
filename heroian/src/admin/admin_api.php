<?php
// 設置響應頭為 JSON
header('Content-Type: application/json');

// 引入數據庫配置
require_once 'config/database.php';

session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '未授權的訪問']);
    exit();
}

// 處理 API 請求
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'updateProfile':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);

            try {
                $conn = getDbConnection();
                $adminId = $_SESSION['admin_id'];

                // 更新管理員資料
                $stmt = $conn->prepare("UPDATE admin_users SET name = ?, email = ? WHERE id = ?");
                $result = $stmt->execute([
                    $input['name'],
                    $input['email'],
                    $adminId
                ]);

                if ($result) {
                    // 更新會話中的管理員姓名
                    $_SESSION['admin_name'] = $input['name'];

                    echo json_encode([
                        'success' => true,
                        'message' => '個人資料已成功更新'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => '更新個人資料失敗']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '數據庫錯誤: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'changePassword':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);

            try {
                $conn = getDbConnection();
                $adminId = $_SESSION['admin_id'];

                // 獲取管理員當前密碼
                $stmt = $conn->prepare("SELECT password FROM admin_users WHERE id = ?");
                $stmt->execute([$adminId]);
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$admin) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => '管理員帳號不存在']);
                    exit();
                }

                // 驗證當前密碼
                if (!password_verify($input['currentPassword'], $admin['password'])) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => '當前密碼不正確']);
                    exit();
                }

                // 更新密碼
                $newPasswordHash = password_hash($input['newPassword'], PASSWORD_DEFAULT);
                $stmt = $conn->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
                $result = $stmt->execute([$newPasswordHash, $adminId]);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => '密碼已成功修改'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => '修改密碼失敗']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '數據庫錯誤: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getProfile':
        if ($method === 'GET') {
            try {
                $conn = getDbConnection();
                $adminId = $_SESSION['admin_id'];

                $stmt = $conn->prepare("SELECT username, name, email FROM admin_users WHERE id = ?");
                $stmt->execute([$adminId]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($profile) {
                    echo json_encode([
                        'success' => true,
                        'data' => $profile
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => '管理員帳號不存在']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '數據庫錯誤: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '不支持的 API 操作']);
        break;
}
