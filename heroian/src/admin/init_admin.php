<?php
// 引入數據庫配置
require_once 'config/database.php';

try {
    $conn = getDbConnection();

    // 創建管理員用戶表
    $sql = "CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        remember_token VARCHAR(255),
        token_expiry DATETIME,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $conn->exec($sql);

    // 檢查是否已經存在管理員帳號
    $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute(['admin']);
    $admin = $stmt->fetch();

    if (!$admin) {
        // 創建管理員帳號
        $username = 'admin';
        $name = '系統管理員';
        $email = 'admin@example.com';
        $password = password_hash('admin123', PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO admin_users (username, password, name, email) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $password, $name, $email]);

        echo "管理員帳號已成功創建！<br>";
        echo "用戶名: admin<br>";
        echo "密碼: admin123<br>";
    } else {
        echo "管理員帳號已存在！<br>";
        echo "用戶名: admin<br>";
        echo "密碼: admin123<br>";
    }

} catch (PDOException $e) {
    die("數據庫錯誤: " . $e->getMessage());
}
