<?php
session_start();

// 清除會話數據
$_SESSION = array();

// 如果需要，也清除會話cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 清除記住我的cookie
if (isset($_COOKIE['admin_remember'])) {
    setcookie('admin_remember', '', time() - 3600, '/');
}

// 銷毀會話
session_destroy();

// 重定向到登入頁面
header('Location: login.html');
exit;
