// 後台管理系統功能函數

// 初始化表單提交處理
document.addEventListener('DOMContentLoaded', function() {
    // 處理所有表單的提交事件
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 獲取表單動作
            const formAction = this.querySelector('input[name="form-action"]');
            const action = formAction ? formAction.value : '';
            
            // 根據表單類型執行相應的操作
            if (action === 'saveSiteSettings') {
                saveSiteSettings();
            } else if (action === 'saveAdminSettings') {
                saveAdminSettings();
            } else if (action === 'saveContact') {
                saveContact();
            } else {
                // 其他表單處理邏輯
                console.log('Unknown form action:', action);
            }
        });
    });
});

// 顯示提示訊息
function showToast(message, type = 'success') {
    const toastElement = document.getElementById(type + 'Toast');
    if (toastElement) {
        const toastBody = toastElement.querySelector('.toast-body');
        toastBody.textContent = message;

        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}

// 加載儀表板數據
function loadDashboardData() {
    fetch('../admin/api.php?action=getDashboardData')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const dashboardData = data.data;

                // 更新統計數據
                const totalArticlesElement = document.getElementById('totalArticlesCount');
                if (totalArticlesElement) {
                    totalArticlesElement.textContent = dashboardData.totalArticles;
                }

                const viewCountElement = document.getElementById('viewCount');
                if (viewCountElement) {
                    viewCountElement.textContent = dashboardData.viewCount.toLocaleString();
                }

                const newCommentsElement = document.getElementById('newCommentsCount');
                if (newCommentsElement) {
                    newCommentsElement.textContent = dashboardData.newComments;
                }
            } else {
                showToast('加載儀表板數據失敗: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('加載儀表板數據時發生錯誤', 'danger');
        });
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
                    const siteTitle = document.getElementById('siteTitle');
                    if (siteTitle) siteTitle.value = settings.siteSettings.siteTitle || '';

                    const siteDescription = document.getElementById('siteDescription');
                    if (siteDescription) siteDescription.value = settings.siteSettings.siteDescription || '';

                    const siteKeywords = document.getElementById('siteKeywords');
                    if (siteKeywords) siteKeywords.value = settings.siteSettings.siteKeywords || '';
                }

                // 載入管理員設定
                if (settings.adminSettings) {
                    const adminName = document.getElementById('adminName');
                    if (adminName) adminName.value = settings.adminSettings.adminName || '';

                    const adminEmail = document.getElementById('adminEmail');
                    if (adminEmail) adminEmail.value = settings.adminSettings.adminEmail || '';
                }
            } else {
                // 使用默認值
                const siteTitle = document.getElementById('siteTitle');
                if (siteTitle) siteTitle.value = '神龍英雄科技部落格';

                const siteDescription = document.getElementById('siteDescription');
                if (siteDescription) siteDescription.value = '分享前端開發、人工智能、軟體工程等技術文章';

                const siteKeywords = document.getElementById('siteKeywords');
                if (siteKeywords) siteKeywords.value = '神龍英雄,科技部落格,前端開發,軟體工程,人工智能';

                const adminEmail = document.getElementById('adminEmail');
                if (adminEmail) adminEmail.value = 'admin@example.com';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // 使用默認值
            const siteTitle = document.getElementById('siteTitle');
            if (siteTitle) siteTitle.value = '神龍英雄科技部落格';

            const siteDescription = document.getElementById('siteDescription');
            if (siteDescription) siteDescription.value = '分享前端開發、人工智能、軟體工程等技術文章';

            const siteKeywords = document.getElementById('siteKeywords');
            if (siteKeywords) siteKeywords.value = '神龍英雄,科技部落格,前端開發,軟體工程,人工智能';

            const adminEmail = document.getElementById('adminEmail');
            if (adminEmail) adminEmail.value = 'admin@example.com';
        });
}

// 保存網站設定
function saveSiteSettings() {
    const siteTitle = document.getElementById('siteTitle');
    const siteDescription = document.getElementById('siteDescription');
    const siteKeywords = document.getElementById('siteKeywords');

    if (!siteTitle || !siteDescription || !siteKeywords) {
        showToast('表單元素不存在', 'danger');
        return;
    }

    const settings = {
        siteTitle: siteTitle.value,
        siteDescription: siteDescription.value,
        siteKeywords: siteKeywords.value
    };

    fetch('../admin/api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'saveSettings',
            subAction: 'saveSiteSettings',
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
    const adminName = document.getElementById('adminName');
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');

    if (!adminName || !adminEmail || !adminPassword) {
        showToast('表單元素不存在', 'danger');
        return;
    }

    const settings = {
        adminName: adminName.value,
        adminEmail: adminEmail.value,
        adminPassword: adminPassword.value
    };

    fetch('../admin/api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'saveSettings',
            subAction: 'saveAdminSettings',
            settings: settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('管理員設定已成功更新', 'success');
            // 清空密碼欄位
            adminPassword.value = '';
        } else {
            showToast('更新管理員設定失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('更新管理員設定時發生錯誤', 'danger');
    });
}

// 查看聯絡資訊
function viewContact(id) {
    fetch(`../admin/api.php?action=getContact&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const contact = data.data;

                // 確保元素存在再設置值
                const nameField = document.getElementById('contactName');
                if (nameField) nameField.value = contact.name || '';

                const emailField = document.getElementById('contactEmail');
                if (emailField) emailField.value = contact.email || '';

                const subjectField = document.getElementById('contactSubject');
                if (subjectField) subjectField.value = contact.subject || '';

                const messageField = document.getElementById('contactMessage');
                if (messageField) messageField.value = contact.message || '';

                const dateField = document.getElementById('contactDate');
                if (dateField) dateField.value = contact.date || '';

                // 儲存當前編輯的聯絡資訊 ID
                const contactForm = document.getElementById('contactForm');
                if (contactForm) {
                    contactForm.dataset.contactId = id;
                }

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

// 保存聯絡資訊
function saveContact() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        showToast('找不到聯絡資訊表單', 'danger');
        return;
    }

    const contactId = contactForm.dataset.contactId || 0;

    if (!contactId) {
        showToast('沒有指定要保存的聯絡資訊', 'danger');
        return;
    }

    const nameField = document.getElementById('contactName');
    const emailField = document.getElementById('contactEmail');
    const subjectField = document.getElementById('contactSubject');
    const messageField = document.getElementById('contactMessage');
    const dateField = document.getElementById('contactDate');

    if (!nameField || !emailField || !subjectField || !messageField || !dateField) {
        showToast('表單元素不存在', 'danger');
        return;
    }

    const contactData = {
        id: contactId,
        name: nameField.value,
        email: emailField.value,
        subject: subjectField.value,
        message: messageField.value,
        date: dateField.value
    };

    fetch('../admin/api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'updateContact',
            contactData: contactData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('聯絡資訊已成功更新', 'success');
            bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
            loadContacts();
        } else {
            showToast('更新聯絡資訊失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('更新聯絡資訊時發生錯誤', 'danger');
    });
}

// 回覆聯絡資訊
function replyContact() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        showToast('找不到聯絡資訊表單', 'danger');
        return;
    }

    const contactId = contactForm.dataset.contactId || 0;

    if (!contactId) {
        showToast('沒有指定要回覆的聯絡資訊', 'danger');
        return;
    }

    const emailField = document.getElementById('contactEmail');
    if (!emailField || !emailField.value) {
        showToast('沒有可用的電子郵件地址', 'danger');
        return;
    }

    // 填充回覆表單
    document.getElementById('replyToEmail').value = emailField.value;
    
    const subjectField = document.getElementById('contactSubject');
    if (subjectField) {
        document.getElementById('replySubject').value = 'Re: ' + (subjectField.value || '聯絡資訊');
    } else {
        document.getElementById('replySubject').value = 'Re: 聯絡資訊';
    }
    
    // 清空回覆內容
    document.getElementById('replyContent').value = '';
    
    // 儲存當前回覆的聯絡資訊 ID
    const replyForm = document.getElementById('replyContactForm');
    if (replyForm) {
        replyForm.dataset.contactId = contactId;
    }
    
    // 打開回覆模態框
    new bootstrap.Modal(document.getElementById('replyContactModal')).show();
}

// 發送回覆
function sendReply() {
    const replyForm = document.getElementById('replyContactForm');
    if (!replyForm) {
        showToast('找不到回覆表單', 'danger');
        return;
    }
    
    const contactId = replyForm.dataset.contactId || 0;
    
    if (!contactId) {
        showToast('沒有指定要回覆的聯絡資訊', 'danger');
        return;
    }
    
    const emailField = document.getElementById('replyToEmail');
    const subjectField = document.getElementById('replySubject');
    const contentField = document.getElementById('replyContent');
    
    if (!emailField || !emailField.value || !subjectField || !subjectField.value || !contentField || !contentField.value) {
        showToast('請填寫完整的回覆資訊', 'danger');
        return;
    }
    
    const replyData = {
        contactId: contactId,
        toEmail: emailField.value,
        subject: subjectField.value,
        content: contentField.value
    };
    
    fetch('../admin/api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'sendReply',
            replyData: replyData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('回覆已成功發送', 'success');
            bootstrap.Modal.getInstance(document.getElementById('replyContactModal')).hide();
        } else {
            showToast('發送回覆失敗: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('發送回覆時發生錯誤', 'danger');
    });
}
