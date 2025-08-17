<?php
// 引入數據庫配置
require_once 'config/database.php';

try {
    $conn = getDbConnection();

    // 創建管理員用戶表（如果不存在）
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
    echo "管理員用戶表已創建或已存在。<br>";

    // 檢查是否已經存在管理員帳號
    $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute(['admin']);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        // 創建管理員帳號
        $username = 'admin';
        $name = '系統管理員';
        $email = 'admin@example.com';
        $password = password_hash('admin123', PASSWORD_DEFAULT);

        // 使用SQLite語法插入數據
        $sql = "INSERT INTO admin_users (username, password, name, email) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$username, $password, $name, $email]);

        echo "<div class='alert alert-success'>管理員帳號已成功創建！</div>";
        echo "<p>用戶名: <strong>admin</strong></p>";
        echo "<p>密碼: <strong>admin123</strong></p>";
        echo "<p>請務必記住這些登入信息，並在測試完畢後刪除此腳本。</p>";
    } else {
        echo "<div class='alert alert-info'>管理員帳號已存在。</div>";
        echo "<p>用戶名: <strong>admin</strong></p>";
        echo "<p>密碼: <strong>admin123</strong></p>";
    }

} catch (PDOException $e) {
    die("<div class='alert alert-danger'>數據庫錯誤: " . $e->getMessage() . "</div>");
}
?>
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>創建管理員帳號</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title text-center">創建管理員帳號</h3>
                    </div>
                    <div class="card-body">
                        <?php
                        // 上面的PHP代碼已經執行了
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
