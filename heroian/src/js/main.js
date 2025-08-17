// This file contains JavaScript code for interactive features of the website.
document.addEventListener('DOMContentLoaded', () => {
    // ====== 🌌 科技感滾動動畫 ======
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 為卡片添加延遲動畫
                if (entry.target.classList.contains('card')) {
                    const titles = entry.target.querySelectorAll('.card-title');
                    titles.forEach((title, index) => {
                        setTimeout(() => {
                            title.style.opacity = '1';
                            title.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // 觀察所有需要動畫的元素
    document.querySelectorAll('.fade-in, .fade-in-scroll, .card, .btn-neon, .accordion-item').forEach(el => {
        observer.observe(el);
    });

    // ====== 🎯 鼠标跟隨效果 ======
    // 注釋掉滑鼠跟隨效果代碼
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.classList.add('cursor-follower');
    document.body.appendChild(cursorFollower);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorFollower.style.left = e.clientX - 5 + 'px';
            cursorFollower.style.top = e.clientY - 5 + 'px';
        }, 100);
    });

    // 為可點擊元素添加特效
    const clickables = document.querySelectorAll('a, button, .card, .accordion-button');
    clickables.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });
        
        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
        
        elem.addEventListener('mousedown', () => {
            cursor.classList.add('active');
            cursorFollower.classList.add('active');
        });
        
        elem.addEventListener('mouseup', () => {
            cursor.classList.remove('active');
            cursorFollower.classList.remove('active');
        });
    });
    const themeKey = 'siteTheme';
    const body = document.body;

    // ====== 🎛 主題初始化 ======
    const savedTheme = localStorage.getItem(themeKey) || 'dark';
    body.classList.add(savedTheme === 'dark' ? 'bg-dark' : 'light-theme');

    const themeBtn = document.getElementById('themeSwitchBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (body.classList.contains('bg-dark')) {
                body.classList.replace('bg-dark', 'light-theme');
                localStorage.setItem(themeKey, 'light');
                themeBtn.innerHTML = "🌞";
            } else {
                body.classList.replace('light-theme', 'bg-dark');
                localStorage.setItem(themeKey, 'dark');
                themeBtn.innerHTML = "🌙";
            }
        });
    }

    // ====== 🔘 按鈕互動 ======
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', () => {
            alert('嚇到你了吧!');
            button.classList.toggle('btn-success');
            button.classList.toggle('btn-primary');
            showToast();
        });
    }

    // ====== 📂 顯示/隱藏內容 ======
    const toggleBtn = document.getElementById('toggleContentBtn');
    const contentBox = document.getElementById('toggleContent');
    if (toggleBtn && contentBox) {
        toggleBtn.addEventListener('click', () => {
            contentBox.classList.toggle('d-none');
        });
    }

    // ====== 📩 表單驗證 ======
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (contactForm.checkValidity()) {
                console.log('姓名:', userName.value);
                console.log('Email:', userEmail.value);
                showToast();
                contactForm.reset();
                contactForm.classList.remove('was-validated');
            } else {
                contactForm.classList.add('was-validated');
            }
        });

        // 即時驗證
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userMessage = document.getElementById('userMessage');

        if (userName) {
            userName.addEventListener('input', () => {
                userName.setCustomValidity(
                    userName.value.trim().length < 2 ? '姓名至少2個字' : ''
                );
            });
        }
        if (userEmail) {
            userEmail.addEventListener('input', () => {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                userEmail.setCustomValidity(
                    !emailPattern.test(userEmail.value) ? '請輸入正確的 Email 格式' : ''
                );
            });
        }
        if (userMessage) {
            userMessage.addEventListener('input', () => {
                userMessage.setCustomValidity(
                    userMessage.value.trim().length < 5 ? '留言至少 5 個字' : ''
                );
            });
        }
    }

    // ====== 🔔 增強 Toast ======
    const myToastEl = document.getElementById('myToast');
    const showToast = (message = '感謝您的留言，我們已收到！', type = 'success') => {
      if (myToastEl) {
        // 更新 Toast 內容和類型
        const toastBody = myToastEl.querySelector('.toast-body');
        if (toastBody) toastBody.textContent = message;
        
        // 移除所有可能的類型類
        myToastEl.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning', 'text-white');
        
        // 根據類型添加相應樣式
        if (type === 'success') {
          myToastEl.classList.add('bg-success', 'text-white');
        } else if (type === 'error') {
          myToastEl.classList.add('bg-danger', 'text-white');
        } else if (type === 'info') {
          myToastEl.classList.add('bg-info', 'text-white');
        } else if (type === 'warning') {
          myToastEl.classList.add('bg-warning', 'text-dark');
        }
        
        // 添加科技動畫效果
        myToastEl.classList.add('tech-toast-enter');
        
        // 顯示 Toast
        const toast = new bootstrap.Toast(myToastEl, {
          autohide: true,
          delay: type === 'error' ? 5000 : 3000
        });
        toast.show();
        
        // 動畫結束後移除類
        setTimeout(() => {
          myToastEl.classList.remove('tech-toast-enter');
        }, 1000);
      }
    };

    // ====== 🌌 增強粒子背景 ======
    particlesJS('particles-js', {
      "particles": {
        "number": { 
          "value": 100,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": { "value": ["#00c6ff", "#0072ff", "#00d4ff"] },
        "shape": { 
          "type": ["circle", "triangle"],
          "stroke": { 
            "width": 0,
            "color": "#000000"
          }
        },
        "opacity": { 
          "value": 0.6,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": { 
          "value": 3,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 2,
            "size_min": 0.3,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#00c6ff",
          "opacity": 0.4,
          "width": 1
        },
        "move": { 
          "enable": true, 
          "speed": 2,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { 
            "enable": true, 
            "mode": "grab",
            "parallax": { "enable": true, "force": 60, "smooth": 10 }
          },
          "onclick": { 
            "enable": true, 
            "mode": "push",
            "parallax": { "enable": true, "force": 60, "smooth": 10 }
          }
        },
        "modes": {
          "grab": { 
            "distance": 140, 
            "line_linked": { 
              "opacity": 1 
            }
          },
          "push": { 
            "particles_nb": 6,
            "parallax": { "enable": true, "force": 60, "smooth": 10 }
          }
        }
      },
      "retina_detect": true
    });
    
    // ====== 💫 點擊特效 ======
    document.addEventListener('click', (e) => {
      // 創建波紋效果
      const ripple = document.createElement('div');
      ripple.classList.add('ripple-effect');
      
      // 計算大小和位置
      const size = Math.max(window.innerWidth, window.innerHeight);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - size / 2 + 'px';
      ripple.style.top = e.clientY - size / 2 + 'px';
      
      // 添加到頁面
      document.body.appendChild(ripple);
      
      // 動畫結束後移除
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
    
    // ====== 📊 視差滾動效果 ======
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      // 導航欄漸變效果
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (scrolled > 50) {
          navbar.style.background = `linear-gradient(90deg, rgba(15, 32, 39, ${0.95 + scrolled/1000}) 0%, rgba(44, 83, 100, ${0.95 + scrolled/1000}) 100%)`;
          navbar.style.boxShadow = `0 4px 20px rgba(0, 0, 0, ${0.3 + scrolled/500}), 0 0 30px rgba(0, 198, 255, ${0.2 + scrolled/1000})`;
        } else {
          navbar.style.background = `linear-gradient(90deg, #0f2027 0%, #2c5364 100%)`;
          navbar.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 198, 255, 0.2)`;
        }
      }
      
      // 為卡片添加視差效果，但排除用戶回饋和聯絡表單區塊
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        // 檢查卡片是否在用戶回饋區塊中
        const feedbackTitle = card.closest('.row')?.querySelector('h2');
        const isInFeedback = feedbackTitle && feedbackTitle.textContent.includes('用戶回饋');
        
        // 檢查卡片是否在聯絡表單區塊中
        const contactForm = card.closest('.row')?.querySelector('#contactForm') || card.closest('#contactForm');
        const isInContact = contactForm !== null;
        
        // 檢查是否在文章詳情頁面
        const articlePage = card.closest('article') !== null;
        
        // 檢查是否在關於我頁面
        const aboutPage = window.location.pathname.includes('about.html');
        
        // 檢查是否在留言區
        const commentForm = card.closest('#commentForm') || card.querySelector('#commentForm');
        const isComment = commentForm !== null;
        
        // 如果在關於我頁面、文章詳情頁面、留言區、用戶回饋或聯絡表單區塊中，則不應用視差效果
        if (!aboutPage && !articlePage && !isComment && !isInFeedback && !isInContact) {
          const speed = card.getAttribute('data-speed') || 0.5;
          const yPos = -(scrolled * speed);
          card.style.transform = `translateY(${yPos}px)`;
        }
      });
    });
    
    // ====== 🔊 打字機效果 ======
    const typeWriter = (element, text, speed = 100) => {
      let i = 0;
      element.innerHTML = '';
      
      const typing = () => {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(typing, speed);
        } else {
          // 打字完成後添加光標閃爍效果
          const cursor = document.createElement('span');
          cursor.classList.add('typing-cursor');
          cursor.innerHTML = '|';
          element.appendChild(cursor);
          
          // 模擬光標閃爍
          setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
          }, 500);
        }
      };
      
      typing();
    };
    
    // 對主標題應用打字機效果
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
      const originalText = mainTitle.textContent;
      mainTitle.textContent = '';
      
      // 延遲開始打字效果，讓頁面先加載
      setTimeout(() => {
        typeWriter(mainTitle, originalText, 80);
      }, 500);
    }
});
