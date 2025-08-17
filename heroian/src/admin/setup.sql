-- ========================================
-- SQLite 版本 Heroian 部落格資料庫
-- ========================================

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 聯絡資訊表
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    reply TEXT,
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 網站設定表
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 管理員設定表
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默認網站設定
INSERT OR REPLACE INTO site_settings (setting_key, setting_value) VALUES
('siteTitle', '神龍英雄科技部落格'),
('siteDescription', '分享前端開發、人工智能、軟體工程等技術文章，提供實用教程與行業洞察。'),
('siteKeywords', '神龍英雄,科技部落格,前端開發,軟體工程,人工智能'),
('contactEmail', 'contact@example.com');

-- 插入默認管理員設定
INSERT OR REPLACE INTO admin_settings (setting_key, setting_value) VALUES
('adminName', '神龍英雄'),
('adminEmail', 'admin@example.com');

-- 插入示例文章
INSERT INTO articles (title, summary, content, author, date, category, status) VALUES
('AI 智能應用入門', '探索人工智能的基本概念和實際應用場景，從機器學習到深度學習的入門指南。', '<p>人工智能（AI）正在改變我們的世界。從智能助手到自動駕駛汽車，AI 技術的應用範圍不斷擴大。</p><p>本文將帶您了解 AI 的基本概念，包括機器學習、深度學習和神經網絡，並探討其在各個領域的實際應用。</p>', '神龍英雄', '2025-06-15', '人工智能', 'published'),
('現代前端框架比較', '詳細比較 React、Vue 和 Angular 三大前端框架的優缺點和適用場景。', '<p>前端開發領域有多個強大的框架可供選擇，每個框架都有其獨特的優勢和適用場景。</p><p>本文將深入比較 React、Vue 和 Angular 三大主流前端框架，幫助您為項目選擇最合適的技術棧。</p>', '神龍英雄', '2025-06-10', '前端開發', 'published'),
('軟體架構設計原則', '探討現代軟體架構設計的核心原則和最佳實踐，幫助構建可擴展的系統。', '<p>良好的軟體架構是系統成功的關鍵。本文將探討單一職責原則、開閉原則、依賴倒轉原則等核心架構設計原則。</p><p>通過實際案例，學習如何應用這些原則設計可維護、可擴展的軟體系統。</p>', '神龍英雄', '2025-06-05', '軟體工程', 'draft'),
('雲原生應用開發', '學習如何使用容器化和微服務架構構建雲原生應用。', '<p>雲原生已成為現代應用開發的主流趨勢。本文將介紹容器化技術（如 Docker）、容器編排（如 Kubernetes）以及微服務架構的設計與實現。</p><p>通過實踐，掌握構建雲原生應用的關鍵技術和方法。</p>', '神龍英雄', '2025-05-28', '雲端技術', 'published');

-- 插入示例聯絡資訊
INSERT INTO contacts (name, email, subject, message, is_read) VALUES
('張三', 'zhangsan@example.com', '關於文章的問題', '您好，我在閱讀您的 AI 智能應用入門文章時，有一些問題想請教...', 0),
('李四', 'lisi@example.com', '合作提案', '我們是一家科技公司，對您的技術文章非常感興趣，希望能與您合作...', 0),
('王五', 'wangwu@example.com', '網站建議', '您的網站內容很豐富，但建議增加更多實際的代碼示例...', 1);
