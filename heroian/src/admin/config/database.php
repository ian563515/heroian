<?php
// 數據庫配置
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // 修改為您的數據庫用戶名
define('DB_PASS', ''); // 修改為您的數據庫密碼
define('DB_NAME', 'heroian'); // 修改為您的數據庫名

// 創建數據庫連接
function getDbConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            )
        );
        return $conn;
    } catch (PDOException $e) {
        // 在實際應用中，這裡應該記錄錯誤日誌
        error_log("數據庫連接失敗: " . $e->getMessage());
        die("數據庫連接失敗");
    }
}

// 初始化數據庫表（如果不存在）
function initializeDatabase() {
    $conn = getDbConnection();

    // 創建管理員用戶表
    $sql = "CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        remember_token TEXT,
        token_expiry DATETIME,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);

    // 檢查是否存在默認管理員帳號
    $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute(['admin']);
    $admin = $stmt->fetch();

    // 如果不存在，創建默認管理員帳號
    if (!$admin) {
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO admin_users (username, password, name, email) VALUES (?, ?, ?, ?)");
        $stmt->execute(['admin', $password, '系統管理員', 'admin@example.com']);
    }

    // 創建文章表
    $sql = "CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        date DATE NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);

    // 創建聯絡資訊表
    $sql = "CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER NOT NULL DEFAULT 0,
        reply TEXT,
        replied_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);

    // 創建網站設定表
    $sql = "CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);

    // 創建管理員設定表
    $sql = "CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);

    $conn = null;
}

// 初始化數據庫
initializeDatabase();
