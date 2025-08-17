// 後台管理系統 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // 初始化彈出提示
    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl)
    });

    // 初始化標籤頁
    var triggerTabList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tab"]'))
    triggerTabList.forEach(function (triggerEl) {
        triggerEl.addEventListener('click', function (event) {
            event.preventDefault();
            var tabId = triggerEl.getAttribute('data-bs-target');
            var tab = new bootstrap.Tab(document.querySelector(tabId));
            tab.show();
            
            // 如果是儀表板標籤，加載儀表板數據
            if (tabId === '#dashboard-tab') {
                loadDashboardData();
            }
        });
    });
    
    // 頁面載入時加載儀表板數據
    loadDashboardData();

    // 加載儀表板數據
    function loadDashboardData() {
        fetch('../admin/api.php?action=getDashboardData')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const dashboardData = data.data;
                    
                    // 更新統計數據
                    document.getElementById('totalArticlesCount').textContent = dashboardData.totalArticles;
                    document.getElementById('viewCount').textContent = dashboardData.viewCount.toLocaleString();
                    document.getElementById('newCommentsCount').textContent = dashboardData.newComments;
                } else {
                    showToast('加載儀表板數據失敗: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('加載儀表板數據時發生錯誤', 'danger');
            });
    }
    
    // 文章管理相關功能
    const articlesTab = document.getElementById('articles-tab');
    if (articlesTab) {
        loadArticles();

        // 新增文章按鈕事件
        document.getElementById('addArticleBtn').addEventListener('click', function() {
            resetArticleForm();
            document.getElementById('articleModalTitle').textContent = '新增文章';
            document.getElementById('articleSubmitBtn').textContent = '新增文章';
            new bootstrap.Modal(document.getElementById('articleModal')).show();
        });

        // 文章表單提交
        document.getElementById('articleForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const articleId = document.getElementById('articleId').value;
            const isEdit = articleId !== '';

            const articleData = {
                title: document.getElementById('articleTitle').value,
                summary: document.getElementById('articleSummary').value,
                content: document.getElementById('articleContent').value,
                author: document.getElementById('articleAuthor').value,
                category: document.getElementById('articleCategory').value,
                status: document.getElementById('articleStatus').value
            };

            if (isEdit) {
                updateArticle(articleId, articleData);
            } else {
                addArticle(articleData);
            }
        });
    }

    // 聯絡資訊相關功能
    const contactTab = document.getElementById('contact-tab');
    if (contactTab) {
        loadContacts();
    }

    // 系統設定相關功能
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
        loadSettings();

        // 系統設定表單提交
        document.getElementById('settingsForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
});

// 加載文章列表
function loadArticles() {
    fetch('../admin/api.php?action=getArticles')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayArticles(data.data);
            } else {
                showToast('加載文章失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('加載文章時發生錯誤', 'danger');
        });
}

// 顯示文章列表
function displayArticles(articles) {
    const articlesList = document.getElementById('articlesList');
    if (!articlesList) return;

    articlesList.innerHTML = '';

    if (articles.length === 0) {
        articlesList.innerHTML = '<tr><td colspan="6" class="text-center">沒有找到文章</td></tr>';
        return;
    }

    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${article.id}</td>
            <td>${article.title}</td>
            <td>${article.category}</td>
            <td>${article.status === 'published' ? '已發布' : '草稿'}</td>
            <td>${article.date}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editArticle(${article.id})" title="編輯">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle(${article.id})" title="刪除">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        articlesList.appendChild(tr);
    });
}

// 編輯文章
function editArticle(id) {
    fetch(`../admin/api.php?action=getArticle&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const article = data.data;
                document.getElementById('articleModalTitle').textContent = '編輯文章';
                document.getElementById('articleSubmitBtn').textContent = '更新文章';
                document.getElementById('articleId').value = article.id;
                document.getElementById('articleTitle').value = article.title;
                document.getElementById('articleSummary').value = article.summary;
                document.getElementById('articleContent').value = article.content;
                document.getElementById('articleAuthor').value = article.author;
                document.getElementById('articleCategory').value = article.category;
                document.getElementById('articleStatus').value = article.status;

                new bootstrap.Modal(document.getElementById('articleModal')).show();
            } else {
                showToast('加載文章失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('加載文章時發生錯誤', 'danger');
        });
}

// 新增文章
function addArticle(articleData) {
    fetch('../admin/api.php?action=addArticle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('文章已成功添加', 'success');
            bootstrap.Modal.getInstance(document.getElementById('articleModal')).hide();
            loadArticles();
        } else {
            showToast('添加文章失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('添加文章時發生錯誤', 'danger');
    });
}

// 更新文章
function updateArticle(id, articleData) {
    fetch('../admin/api.php?action=updateArticle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...articleData, id: id})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('文章已成功更新', 'success');
            bootstrap.Modal.getInstance(document.getElementById('articleModal')).hide();
            loadArticles();
        } else {
            showToast('更新文章失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('更新文章時發生錯誤', 'danger');
    });
}

// 刪除文章
function deleteArticle(id) {
    if (confirm('確定要刪除這篇文章嗎？此操作無法撤銷。')) {
        fetch('../admin/api.php?action=deleteArticle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('文章已成功刪除', 'success');
                loadArticles();
            } else {
                showToast('刪除文章失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('刪除文章時發生錯誤', 'danger');
        });
    }
}

// 重置文章表單
function resetArticleForm() {
    document.getElementById('articleId').value = '';
    document.getElementById('articleTitle').value = '';
    document.getElementById('articleSummary').value = '';
    document.getElementById('articleContent').value = '';
    document.getElementById('articleAuthor').value = '';
    document.getElementById('articleCategory').value = '';
    document.getElementById('articleStatus').value = 'draft';
}

// 加載聯絡資訊
function loadContacts() {
    fetch('../admin/api.php?action=getContacts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayContacts(data.data);
            } else {
                showToast('加載聯絡資訊失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('加載聯絡資訊時發生錯誤', 'danger');
        });
}

// 顯示聯絡資訊
function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;

    contactsList.innerHTML = '';

    if (contacts.length === 0) {
        contactsList.innerHTML = '<tr><td colspan="6" class="text-center">沒有找到聯絡資訊</td></tr>';
        return;
    }

    contacts.forEach(contact => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contact.id}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.subject}</td>
            <td>${contact.date}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewContact(${contact.id})" title="查看">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${contact.id})" title="刪除">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        contactsList.appendChild(tr);
    });
}

// 查看聯絡資訊
function viewContact(id) {
    fetch(`../admin/api.php?action=getContact&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const contact = data.data;
                document.getElementById('contactName').value = contact.name;
                document.getElementById('contactEmail').value = contact.email;
                document.getElementById('contactSubject').value = contact.subject;
                document.getElementById('contactMessage').value = contact.message;
                document.getElementById('contactDate').value = contact.date;
                
                // 儲存當前編輯的聯絡資訊 ID
                document.getElementById('contactForm').dataset.contactId = id;

                new bootstrap.Modal(document.getElementById('contactModal')).show();
            } else {
                showToast('加載聯絡資訊失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('加載聯絡資訊時發生錯誤', 'danger');
        });
}

// 刪除聯絡資訊
function deleteContact(id) {
    if (confirm('確定要刪除這條聯絡資訊嗎？此操作無法撤銷。')) {
        fetch('../admin/api.php?action=deleteContact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('聯絡資訊已成功刪除', 'success');
                loadContacts();
            } else {
                showToast('刪除聯絡資訊失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('刪除聯絡資訊時發生錯誤', 'danger');
        });
    }
}

// 加載系統設定
function loadSettings() {
    fetch('../admin/api.php?action=getSettings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const settings = data.data;
                
                // 載入網站設定
                if (settings.siteSettings) {
                    document.getElementById('siteTitle').value = settings.siteSettings.siteTitle || '';
                    document.getElementById('siteDescription').value = settings.siteSettings.siteDescription || '';
                    document.getElementById('siteKeywords').value = settings.siteSettings.siteKeywords || '';
                }
                
                // 載入管理員設定
                if (settings.adminSettings) {
                    document.getElementById('adminName').value = settings.adminSettings.adminName || '';
                    document.getElementById('adminEmail').value = settings.adminSettings.adminEmail || '';
                }
            } else {
                // 使用默認值
                document.getElementById('siteTitle').value = '神龍英雄科技部落格';
                document.getElementById('siteDescription').value = '分享前端開發、人工智能、軟體工程等技術文章';
                document.getElementById('siteKeywords').value = '神龍英雄,科技部落格,前端開發,軟體工程,人工智能';
                document.getElementById('adminEmail').value = 'admin@example.com';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // 使用默認值
            document.getElementById('siteTitle').value = '神龍英雄科技部落格';
            document.getElementById('siteDescription').value = '分享前端開發、人工智能、軟體工程等技術文章';
            document.getElementById('siteKeywords').value = '神龍英雄,科技部落格,前端開發,軟體工程,人工智能';
            document.getElementById('adminEmail').value = 'admin@example.com';
        });
}

// 保存網站設定
function saveSiteSettings() {
    const settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        siteKeywords: document.getElementById('siteKeywords').value
    };

    fetch('../admin/api.php?action=saveSettings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'saveSiteSettings',
            settings: settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('網站設定已成功保存', 'success');
        } else {
            showToast('保存網站設定失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('保存網站設定時發生錯誤', 'danger');
    });
}

// 保存管理員設定
function saveAdminSettings() {
    const settings = {
        adminName: document.getElementById('adminName').value,
        adminEmail: document.getElementById('adminEmail').value,
        adminPassword: document.getElementById('adminPassword').value
    };

    fetch('../admin/api.php?action=saveSettings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'saveAdminSettings',
            settings: settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('管理員設定已成功更新', 'success');
            // 清空密碼欄位
            document.getElementById('adminPassword').value = '';
        } else {
            showToast('更新管理員設定失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('更新管理員設定時發生錯誤', 'danger');
    });
}

    showToast('系統設定已成功保存', 'success');
}

// 顯示提示訊息
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi bi-${type === 'success' ? 'check-circle text-success' : type === 'danger' ? 'exclamation-circle text-danger' : 'info-circle text-info'} me-2"></i>
                <strong class="me-auto">系統提示</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

// 創建提示訊息容器
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// 匯出文章
function exportArticles() {
    showToast('正在準備匯出文章...', 'info');

    // 在實際應用中，這裡應該從伺服器獲取文章數據並生成匯出文件
    setTimeout(() => {
        showToast('文章已成功匯出', 'success');
    }, 1500);
}
