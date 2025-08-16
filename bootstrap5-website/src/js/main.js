// This file contains JavaScript code for interactive features of the website.

document.addEventListener('DOMContentLoaded', function() {
    // Example: Add a click event listener to a button
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', function() {
            alert('嚇到你了吧!');
            // 點擊後改變按鈕顏色
            button.classList.toggle('btn-success');
            button.classList.toggle('btn-primary');
        });
    }

    // 顯示/隱藏內容
    const toggleBtn = document.getElementById('toggleContentBtn');
    const contentBox = document.getElementById('toggleContent');
    if (toggleBtn && contentBox) {
        toggleBtn.addEventListener('click', function() {
            contentBox.classList.toggle('d-none');
        });
    }

    // 主題切換
    const themeBtn = document.getElementById('themeSwitchBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            document.body.classList.toggle('bg-dark');
            document.body.classList.toggle('text-white');
        });
    }

    // 表單驗證與資料接收
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // 阻止表單預設送出
            event.stopPropagation();

            if (contactForm.checkValidity()) {
                // 取得輸入值
                const name = document.getElementById('userName').value;
                const email = document.getElementById('userEmail').value;

                // 這裡可以進行後續處理，例如顯示、送到伺服器
                console.log('姓名:', name);
                console.log('Email:', email);

                // 顯示 Toast 訊息
                showToast();

                // 清空表單
                contactForm.reset();
                contactForm.classList.remove('was-validated');
            } else {
                contactForm.classList.add('was-validated');
            }
        }, false);
    }

    // Toast 訊息
    const myToastEl = document.getElementById('myToast');
    const showToast = () => {
      if (myToastEl) {
        const toast = new bootstrap.Toast(myToastEl);
        toast.show();
      }
    };
    // 在表單送出成功時呼叫 showToast();

    // 例如：按下 myButton 時顯示 Toast
    if (button) {
        button.addEventListener('click', function() {
            alert('嚇到你了吧!');
            button.classList.toggle('btn-success');
            button.classList.toggle('btn-primary');
            showToast(); // 顯示 Toast
        });
    }

    // 主題初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 主題初始化
        const themeKey = 'siteTheme';
        const savedTheme = localStorage.getItem(themeKey);
        if (savedTheme === 'dark') {
            document.body.classList.add('bg-dark', 'text-white');
        }

        // 主題切換
        const themeBtn = document.getElementById('themeSwitchBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                document.body.classList.toggle('bg-dark');
                document.body.classList.toggle('text-white');
                // 儲存主題狀態
                if (document.body.classList.contains('bg-dark')) {
                    localStorage.setItem(themeKey, 'dark');
                } else {
                    localStorage.setItem(themeKey, 'light');
                }
            });
        }

        // 即時表單驗證
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userMessage = document.getElementById('userMessage');

        if (userName) {
            userName.addEventListener('input', function() {
                if (userName.value.trim().length < 2) {
                    userName.setCustomValidity('姓名至少2個字');
                } else {
                    userName.setCustomValidity('');
                }
            });
        }

        if (userEmail) {
            userEmail.addEventListener('input', function() {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(userEmail.value)) {
                    userEmail.setCustomValidity('請輸入正確的 Email 格式');
                } else {
                    userEmail.setCustomValidity('');
                }
            });
        }

        if (userMessage) {
            userMessage.addEventListener('input', function() {
              if (userMessage.value.trim().length < 5) {
                userMessage.setCustomValidity('留言至少 5 個字');
              } else {
                userMessage.setCustomValidity('');
              }
            });
        }
    });

    particlesJS('particles-js', {
      "particles": {
        "number": { "value": 60 },
        "color": { "value": "#00c6ff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5 },
        "size": { "value": 3 },
        "line_linked": {
          "enable": true,
          "distance": 120,
          "color": "#00c6ff",
          "opacity": 0.4,
          "width": 1
        },
        "move": { "enable": true, "speed": 2 }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "repulse" },
          "onclick": { "enable": true, "mode": "push" }
        },
        "modes": {
          "repulse": { "distance": 80 },
          "push": { "particles_nb": 4 }
        }
      },
      "retina_detect": true
    });
});