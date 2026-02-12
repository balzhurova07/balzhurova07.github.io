document.addEventListener('DOMContentLoaded', function() {
    // ---------- МУЗЫКА (единое состояние для всех страниц) ----------
    const music = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggleBtn');

    // Восстанавливаем состояние музыки из localStorage
    let musicPlaying = localStorage.getItem('musicPlaying') === 'true';
    let musicTime = parseFloat(localStorage.getItem('musicTime')) || 0;

    if (music) {
        music.currentTime = musicTime;
        if (musicPlaying) {
            music.play().catch(() => {}); // игнорируем ошибки автовоспроизведения
            musicBtn.textContent = '⏸️ Выключить музыку';
        } else {
            musicBtn.textContent = '🎵 Включить музыку';
        }

        musicBtn.addEventListener('click', function() {
            if (music.paused) {
                music.play();
                musicBtn.textContent = '⏸️ Выключить музыку';
                localStorage.setItem('musicPlaying', 'true');
            } else {
                music.pause();
                musicBtn.textContent = '🎵 Включить музыку';
                localStorage.setItem('musicPlaying', 'false');
            }
        });

        // Сохраняем текущее время музыки при уходе со страницы
        window.addEventListener('beforeunload', function() {
            localStorage.setItem('musicTime', music.currentTime);
        });
    }

    // ---------- ЛОГИКА ДЛЯ index.html (убегающая кнопка "Нет") ----------
if (document.body.id === 'page-index') {
    const noBtn = document.getElementById('noBtn');
    const wrapper = document.querySelector('.button-wrapper');

    // Убеждаемся, что кнопка позиционируется абсолютно внутри wrapper
    noBtn.style.position = 'absolute';
    
    // Начальное положение (можно не задавать, оставим CSS)
    function moveNoButton() {
        // Получаем размеры wrapper и кнопки
        const wrapperRect = wrapper.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        
        // Доступное пространство для перемещения (с учётом отступов)
        const maxLeft = wrapperRect.width - btnRect.width - 10;
        const maxTop = wrapperRect.height - btnRect.height - 10;
        
        // Если контейнер слишком мал – не двигаем
        if (maxLeft <= 0 || maxTop <= 0) return;
        
        // Случайные координаты, но не меньше 0 и не больше max
        let newLeft = Math.random() * maxLeft;
        let newTop = Math.random() * maxTop;
        
        // Применяем новые координаты (в пикселях, относительно wrapper)
        noBtn.style.left = newLeft + 'px';
        noBtn.style.top = newTop + 'px';
    }

    // События: при клике и при наведении
    noBtn.addEventListener('click', moveNoButton);
    noBtn.addEventListener('mouseover', moveNoButton);
    
    // Дополнительно: при загрузке страницы поставим кнопку в случайное место
    window.addEventListener('load', function() {
        // Небольшая задержка, чтобы браузер успел рассчитать размеры
        setTimeout(moveNoButton, 10);
    });
}

// ---------- ЛОГИКА ДЛЯ step2.html (проценты + предупреждение + переходы) ----------
if (document.body.id === 'page-step2') {
    const loveScale = document.getElementById('loveScale');
    const scaleValue = document.getElementById('scaleValue');
    const loveWarning = document.getElementById('loveWarning');
    const continueBtn = document.getElementById('continueBtn');
    const transparentText = document.getElementById('transparentText');

    // Флаг: было ли уже показано предупреждение?
    let warningShown = false;

    // Массив фраз для низкого процента
    const warningPhrases = [
        'Точно? 😏',
        'Ты уверен? 🧐',
        'Всего лишь {percent}%? 😢',
        'Маловато будет... 💔',
        'Только {percent}%?! 😲',
        'Эх, а я надеялась... 💭',
        'Пересмотри своё решение ✨',
        'Ой ли? 😅',
        '{percent}% — это обидно 🥺',
        'Может, добавим? 🥰'
    ];

    function updateLoveWarning(value) {
        if (value < 70) {   // порог 70% – можно изменить
            let randomIndex = Math.floor(Math.random() * warningPhrases.length);
            let phrase = warningPhrases[randomIndex];
            phrase = phrase.replace('{percent}', value);
            loveWarning.textContent = phrase;
            loveWarning.style.display = 'block';
        } else {
            loveWarning.style.display = 'none';
        }
    }

    if (loveScale) {
        scaleValue.textContent = loveScale.value + '%';
        updateLoveWarning(parseInt(loveScale.value));

        loveScale.addEventListener('input', function() {
            let val = this.value;
            scaleValue.textContent = val + '%';
            updateLoveWarning(parseInt(val));
        });
    }

    // ===== КНОПКА "ПРОДОЛЖИТЬ" =====
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (!warningShown) {
                // Первый раз: показываем предупреждение, остаёмся на месте
                alert('🧐 Ты уверен, что любовь измеряется в процентах?');
                warningShown = true;
                // НИКАКОГО ПЕРЕХОДА!
            } else {
                // Второй раз: сразу переходим на финальную страницу
                location.href = 'step3.html';
            }
        });
    }

    // ===== ПРОЗРАЧНЫЙ ТЕКСТ =====
    if (transparentText) {
        transparentText.addEventListener('click', function() {
            // Всегда сразу переходим, без предупреждений
            location.href = 'step3.html';
        });
    }
}    // ---------- ЛОГИКА ДЛЯ step3.html (ответы + админка) ----------
if (document.body.id === 'page-step3') {
    const sendReplyBtn = document.getElementById('sendReplyBtn');
    const replyInput = document.getElementById('replyInput');
    const afterReplyMessage = document.getElementById('afterReplyMessage'); // теперь всегда видимо
    const adminPanel = document.getElementById('adminPanel');
    const savedRepliesDiv = document.getElementById('savedReplies');
    const clearRepliesBtn = document.getElementById('clearRepliesBtn');

    // Функция сохранения ответа в localStorage
    function saveReply(text) {
        let replies = JSON.parse(localStorage.getItem('danilReplies')) || [];
        replies.push({
            date: new Date().toLocaleString(),
            text: text
        });
        localStorage.setItem('danilReplies', JSON.stringify(replies));
    }

    // Отправка ответа
    sendReplyBtn.addEventListener('click', function() {
    const replyText = replyInput.value.trim();
    if (replyText === '') {
        alert('Напиши хоть что-нибудь ❤️');
        return;
    }

    // 1. Сохраняем в localStorage (как было)
    saveReply(replyText);

    // 2. ОТПРАВЛЯЕМ ТЕБЕ НА ПОЧТУ (надёжный JSON-метод для GitHub Pages)
fetch('https://formspree.io/f/xqedpqbp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({ 
        message: replyText,
        date: new Date().toLocaleString(),
        from: 'Даниил'
    })
})
.then(response => {
    if (response.ok) {
        console.log('✅ Ответ улетел на почту!');
    } else {
        console.log('❌ Ошибка отправки');
    }
})
.catch(error => console.error('Ошибка:', error));

    // 3. Блокируем поле и кнопку
    replyInput.value = '';
    replyInput.disabled = true;
    sendReplyBtn.disabled = true;
    sendReplyBtn.style.opacity = '0.5';

    // 4. Показываем «обманку» (она уже видна, но можно подсветить)
    afterReplyMessage.style.display = 'block'; // если вдруг скрыта
});

    // Показываем админку при загрузке, если есть хэш
    showAdminPanel();

    // Следим за изменением хэша (если пользователь введёт #admin вручную)
    window.addEventListener('hashchange', showAdminPanel);
}

        // ---------- АДМИН-ПАНЕЛЬ (по #admin в URL) ----------
        function showAdminPanel() {
            if (window.location.hash === '#admin') {
                adminPanel.style.display = 'block';
                loadReplies();
            } else {
                adminPanel.style.display = 'none';
            }
        }

        function loadReplies() {
            const replies = JSON.parse(localStorage.getItem('danilReplies')) || [];
            if (replies.length === 0) {
                savedRepliesDiv.innerHTML = '<p>Пока нет ответов 😢</p>';
            } else {
                let html = '';
                replies.reverse().forEach(r => {
                    html += `<div style="border-bottom:1px solid #ffc0cb; padding:10px;">
                                <small>${r.date}</small>
                                <p style="font-weight:bold; margin:5px 0;">${r.text}</p>
                            </div>`;
                });
                savedRepliesDiv.innerHTML = html;
            }
        }

        // Очистка ответов
        if (clearRepliesBtn) {
            clearRepliesBtn.addEventListener('click', function() {
                localStorage.removeItem('danilReplies');
                loadReplies();
            });
        }

        // Показываем админку при загрузке, если есть хэш
        showAdminPanel();

        // Следим за изменением хэша (если пользователь введёт #admin вручную)
        window.addEventListener('hashchange', showAdminPanel);
    }

);

