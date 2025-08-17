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
  ;

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
            
            $contactIndex = -1;
            foreach ($contacts as $index => $contact) {
                if ($contact['id'] === $id) {
                    $contactIndex = $index;
                    break;
                }
            }
            
            if ($contactIndex !== -1) {
                // 在實際應用中，這裡應該更新數據庫中的聯絡資訊
                $contacts[$contactIndex] = [
                    'id' => $id,
                    'name' => $contactData['name'],
                    'email' => $contactData['email'],
                    'subject' => $contactData['subject'],
                    'message' => $contactData['message'],
                    'date' => $contacts[$contactIndex]['date'] // 保留原始日期
                ];
                
                echo json_encode([
                    'success' => true,
                    'message' => '聯絡資訊已成功更新'
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
        
    case 'deleteContact':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            $contactIndex = -1;
            foreach ($contacts as $index => $contact) {
                if ($contact['id'] === $id) {
                    $contactIndex = $index;
                    break;
                }
            }

            if ($contactIndex !== -1) {
                // 在實際應用中，這裡應該從數據庫中刪除聯絡資訊
                array_splice($contacts, $contactIndex, 1);

                echo json_encode([
                    'success' => true,
                    'message' => '聯絡資訊已成功刪除'
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

    case 'getSettings':
        if ($method === 'GET') {
            $settings = [
                'siteSettings' => isset($_SESSION['site_settings']) ? $_SESSION['site_settings'] : [],
                'adminSettings' => isset($_SESSION['admin_settings']) ? $_SESSION['admin_settings'] : []
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $settings
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => '不支持的請求方法']);
        }
        break;
        
    case 'getDashboardData':
        if ($method === 'GET') {
            // 統計已發布的文章數
            $publishedArticles = array_filter($articles, function($article) {
                return $article['status'] === 'published';
            });
            
            // 模擬瀏覽量（實際應用中應從數據庫統計）
            $viewCount = rand(1000, 2000);
            
            // 計算新留言數（實際應用中應從數據庫統計）
            $newComments = 3;
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'totalArticles' => count($articles),
                    'publishedArticles' => count($publishedArticles),
                    'viewCount' => $viewCount,
                    'newComments' => $newComments
                ]
            ]);
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
            
            if ($subAction === 'saveSiteSettings') {
                // 模擬保存網站設定到 session
                $_SESSION['site_settings'] = $settings;
                
                // 實際應用中，這裡應該將設定保存到數據庫
                echo json_encode([
                    'success' => true,
                    'message' => '網站設定已成功保存'
                ]);
            } elseif ($subAction === 'saveAdminSettings') {
                // 模擬保存管理員設定到 session
                if (!empty($settings['adminPassword'])) {
                    // 在實際應用中，應該對密碼進行哈希處理
                    $_SESSION['admin_settings']['password'] = $settings['adminPassword'];
                    echo json_encode([
                        'success' => true,
                        'message' => '管理員設定已成功更新'
                    ]);
                } else {
                    $_SESSION['admin_settings']['email'] = $settings['adminEmail'];
                    echo json_encode([
                        'success' => true,
                        'message' => '管理員 Email 已成功更新'
                    ]);
                }
                $_SESSION['admin_settings']['name'] = $settings['adminName'];
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => '不支持的設定操作']);
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