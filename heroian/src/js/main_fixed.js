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
    /*
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
    */

        // 初始化粒子背景
        particlesJS('particles-js', {
          "particles": {
            "number": { "value": 80 },
            "color": { "value": "#00c6ff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.6 },
            "size": { "value": 3 },
            "line_linked": {
              "enable": true,
              "distance": 130,
              "color": "#00c6ff",
              "opacity": 0.5,
              "width": 1.2
            },
            "move": { "enable": true, "speed": 2.5 }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": { "enable": true, "mode": "grab" },
              "onclick": { "enable": true, "mode": "push" }
            },
            "modes": {
              "grab": { "distance": 150, "line_linked": { "opacity": 0.8 } },
              "push": { "particles_nb": 4 }
            }
          },
          "retina_detect": true
        });

    // ====== 🌊 導覽列滾動效果 ======
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
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

      // 為卡片添加視差效果，但排除關於我頁面、文章詳情頁面、留言區、用戶回饋和聯絡表單區塊
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        // 檢查卡片是否在用戶回饋區塊中
        const feedbackTitle = card.closest('.row')?.querySelector('h2');
        const isInFeedback = feedbackTitle && feedbackTitle.textContent.includes('用戶回饋');

        // 檢查卡片是否在聯絡表單區塊中
        const contactForm = card.closest('.row')?.querySelector('#contactForm') || card.closest('#contactForm');
        const isInContact = contactForm !== null;

        // 檢查是否在關於我頁面
        const aboutPage = window.location.pathname.includes('about.html');

        // 檢查是否在文章詳情頁面
        const articlePage = card.closest('article') !== null;

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

    // ====== 🎛 主題切換功能 ======
    const themeKey = 'siteTheme';
    const body = document.body;

    // 初始化主題
    const savedTheme = localStorage.getItem(themeKey) || 'dark';
    body.classList.add(savedTheme === 'dark' ? 'bg-dark' : 'light-theme');

    const themeBtn = document.getElementById('themeSwitchBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            // 切換主題
            const isDark = body.classList.contains('bg-dark');

            if (isDark) {
                body.classList.remove('bg-dark');
                body.classList.add('light-theme');
                localStorage.setItem(themeKey, 'light');
                themeBtn.innerHTML = '<i class="bi bi-moon-stars"></i> 深色模式';
            } else {
                body.classList.remove('light-theme');
                body.classList.add('bg-dark');
                localStorage.setItem(themeKey, 'dark');
                themeBtn.innerHTML = '<i class="bi bi-sun"></i> 淺色模式';
            }
        });
    }
});
