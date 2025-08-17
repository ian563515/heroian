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

// 從數據庫獲取文章數據
function getArticles() {
    try {
        $conn = getDbConnection();
        $stmt = $conn->query("SELECT * FROM articles ORDER BY date DESC");
        $articles = $stmt->fetchAll();
        $conn = null;
        return $articles;
    } catch (PDOException $e) {
        error_log("獲取文章失敗: " . $e->getMessage());
        return [];
    }
}

// 從數據庫獲取聯絡資訊
function getContacts($filter = 'all') {
    try {
        $conn = getDbConnection();
        $sql = "SELECT * FROM contacts";

        if ($filter === 'unread') {
            $sql .= " WHERE is_read = 0";
        } elseif ($filter === 'read') {
            $sql .= " WHERE is_read = 1";
        }

        $sql .= " ORDER BY date DESC";

        $stmt = $conn->query($sql);
        $contacts = $stmt->fetchAll();
        $conn = null;
        return $contacts;
    } catch (PDOException $e) {
        error_log("獲取聯絡資訊失敗: " . $e->getMessage());
        return [];
    }
}

// 獲取單個聯絡資訊
function getContact($id) {
    try {
        $conn = getDbConnection();
        $stmt = $conn->prepare("SELECT * FROM contacts WHERE id = ?");
        $stmt->execute([$id]);
        $contact = $stmt->fetch();
        $conn = null;
        return $contact;
    } catch (PDOException $e) {
        error_log("獲取聯絡資訊失敗: " . $e->getMessage());
        return false;
    }
}

// 獲取所有文章
$articles = getArticles();

// 獲取所有聯絡資訊
$contacts = getContacts();

// 處理 API 請求
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'getArticles':
        if ($method === 'GET') {
            $status = isset($_GET['status']) ? $_GET['status'] : 'all';

            if ($status === 'all') {
                $result = $articles;
            } else {
                $result = array_filter($articles, function($article) use ($status) {
                    return $article['status'] === $status;
                });
            }

            echo json_encode([
                'success' => true,
                'data' => array_values($result)
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getArticle':
        if ($method === 'GET') {
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            $result = null;

            foreach ($articles as $article) {
                if ($article['id'] === $id) {
                    $result = $article;
                    break;
                }
            }

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => '文章不存在']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'addArticle':
        if ($method === 'POST') {
            // 在實際應用中，這裡應該驗證和清理輸入數據
            $input = json_decode(file_get_contents('php://input'), true);

            try {
                $conn = getDbConnection();
                $stmt = $conn->prepare("INSERT INTO articles (title, summary, content, author, date, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['title'],
                    $input['summary'],
                    $input['content'],
                    $input['author'],
                    date('Y-m-d'),
                    $input['category'],
                    'draft'
                ]);
                $newId = $conn->lastInsertId();
                $conn = null;

                echo json_encode([
                    'success' => true,
                    'message' => '文章已成功添加',
                    'data' => ['id' => $newId]
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '添加文章失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'updateArticle':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            // 检查文章是否存在
            $articleExists = false;
            $articleIndex = -1;
            foreach ($articles as $index => $article) {
                if ($article['id'] === $id) {
                    $articleExists = true;
                    $articleIndex = $index;
                    break;
                }
            }

            if ($articleExists) {
                try {
                    $conn = getDbConnection();
                    $stmt = $conn->prepare("UPDATE articles SET title = ?, summary = ?, content = ?, author = ?, category = ?, status = ? WHERE id = ?");
                    $stmt->execute([
                        $input['title'],
                        $input['summary'],
                        $input['content'],
                        $input['author'],
                        $input['category'],
                        $input['status'],
                        $id
                    ]);
                    $conn = null;

                    echo json_encode([
                        'success' => true,
                        'message' => '文章已成功更新',
                        'data' => $articles[$articleIndex]
                    ]);
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => '更新文章失敗: ' . $e->getMessage()]);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => '文章不存在']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getContacts':
        if ($method === 'GET') {
            echo json_encode([
                'success' => true,
                'data' => $contacts
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getContact':
        if ($method === 'GET') {
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            $result = null;

            foreach ($contacts as $contact) {
                if ($contact['id'] === $id) {
                    $result = $contact;
                    break;
                }
            }

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => '聯絡資訊不存在']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'updateContact':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $action = isset($input['action']) ? $input['action'] : '';
            $contactData = isset($input['contactData']) ? $input['contactData'] : [];
            $id = isset($contactData['id']) ? (int)$contactData['id'] : 0;

            try {
                $conn = getDbConnection();
                $stmt = $conn->prepare("UPDATE contacts SET name = ?, email = ?, subject = ?, message = ? WHERE id = ?");
                $result = $stmt->execute([
                    $contactData['name'],
                    $contactData['email'],
                    $contactData['subject'],
                    $contactData['message'],
                    $id
                ]);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => '聯絡資訊已成功更新'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => '聯絡資訊不存在']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '更新聯絡資訊失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'deleteContact':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            try {
                $conn = getDbConnection();
                $stmt = $conn->prepare("DELETE FROM contacts WHERE id = ?");
                $result = $stmt->execute([$id]);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => '聯絡資訊已成功刪除'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => '聯絡資訊不存在']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '刪除聯絡資訊失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'markAsRead':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            try {
                $conn = getDbConnection();
                $stmt = $conn->prepare("UPDATE contacts SET is_read = 1 WHERE id = ?");
                $result = $stmt->execute([$id]);

                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => '已標記為已讀取'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => '聯絡資訊不存在']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '標記已讀取失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getSettings':
        if ($method === 'GET') {
            try {
                $conn = getDbConnection();

                // 獲取網站設定
                $siteSettingsStmt = $conn->query("SELECT * FROM site_settings");
                $siteSettings = [];
                while ($row = $siteSettingsStmt->fetch()) {
                    $siteSettings[$row['setting_key']] = $row['setting_value'];
                }

                // 獲取管理員設定
                $adminSettingsStmt = $conn->query("SELECT * FROM admin_settings");
                $adminSettings = [];
                while ($row = $adminSettingsStmt->fetch()) {
                    $adminSettings[$row['setting_key']] = $row['setting_value'];
                }

                $settings = [
                    'siteSettings' => $siteSettings,
                    'adminSettings' => $adminSettings
                ];

                echo json_encode([
                    'success' => true,
                    'data' => $settings
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '獲取設定失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'getDashboardData':
        if ($method === 'GET') {
            try {
                $conn = getDbConnection();

                // 統計已發布的文章數
                $publishedStmt = $conn->prepare("SELECT COUNT(*) as count FROM articles WHERE status = ?");
                $publishedStmt->execute(['published']);
                $publishedCount = $publishedStmt->fetch()['count'];

                // 統計草稿文章數
                $draftStmt = $conn->prepare("SELECT COUNT(*) as count FROM articles WHERE status = ?");
                $draftStmt->execute(['draft']);
                $draftCount = $draftStmt->fetch()['count'];

                // 統計未讀聯絡資訊數
                $unreadStmt = $conn->prepare("SELECT COUNT(*) as count FROM contacts WHERE is_read = 0");
                $unreadStmt->execute();
                $unreadCount = $unreadStmt->fetch()['count'];

                // 總文章數
                $totalArticlesStmt = $conn->prepare("SELECT COUNT(*) as count FROM articles");
                $totalArticlesStmt->execute();
                $totalArticlesCount = $totalArticlesStmt->fetch()['count'];

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'totalArticles' => $totalArticlesCount,
                        'publishedArticles' => $publishedCount,
                        'draftArticles' => $draftCount,
                        'unreadContacts' => $unreadCount
                    ]
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '獲取儀表板數據失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'saveSettings':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $action = isset($input['action']) ? $input['action'] : '';
            $subAction = isset($input['subAction']) ? $input['subAction'] : '';
            $settings = isset($input['settings']) ? $input['settings'] : [];

            try {
                $conn = getDbConnection();

                if ($subAction === 'saveSiteSettings') {
                    // 保存網站設定到數據庫
                    foreach ($settings as $key => $value) {
                        // SQLite語法：先嘗試插入，如果已存在則更新
                        $stmt = $conn->prepare("INSERT OR REPLACE INTO site_settings (setting_key, setting_value) VALUES (?, ?)");
                        $stmt->execute([$key, $value]);
                    }

                    echo json_encode([
                        'success' => true,
                        'message' => '網站設定已成功保存'
                    ]);
                } elseif ($subAction === 'saveAdminSettings') {
                    // 保存管理員設定到數據庫
                    foreach ($settings as $key => $value) {
                        // SQLite語法：先嘗試插入，如果已存在則更新
                        $stmt = $conn->prepare("INSERT OR REPLACE INTO admin_settings (setting_key, setting_value) VALUES (?, ?)");
                        $stmt->execute([$key, $value]);
                    }

                    echo json_encode([
                        'success' => true,
                        'message' => '管理員設定已成功更新'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => '不支持的設定操作']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '保存設定失敗: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;

    case 'sendReply':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $action = isset($input['action']) ? $input['action'] : '';
            $replyData = isset($input['replyData']) ? $input['replyData'] : [];
            $contactId = isset($replyData['contactId']) ? (int)$replyData['contactId'] : 0;
            $toEmail = isset($replyData['toEmail']) ? $replyData['toEmail'] : '';
            $subject = isset($replyData['subject']) ? $replyData['subject'] : '';
            $content = isset($replyData['content']) ? $replyData['content'] : '';

            if (empty($contactId) || empty($toEmail) || empty($subject) || empty($content)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => '缺少必要的回覆資訊']);
                break;
            }

            try {
                // 標記聯絡資訊為已讀取
                $conn = getDbConnection();
                $stmt = $conn->prepare("UPDATE contacts SET is_read = 1 WHERE id = ?");
                $stmt->execute([$contactId]);

                // 在實際應用中，這裡應該使用 PHPMailer 或其他郵件庫發送郵件
                // 模擬發送郵件
                $mailSent = true; // 設置為 false 以測試失敗情況

                if ($mailSent) {
                    echo json_encode([
                        'success' => true,
                        'message' => '回覆已成功發送'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => '發送郵件失敗']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '發送回覆失敗: ' . $e->getMessage()]);
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
?>