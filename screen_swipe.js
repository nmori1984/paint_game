// 画面スワイプによる3画面切り替え
(function() {
    const wrapper = document.getElementById('screen-wrapper');
    const screens = Array.from(wrapper.getElementsByClassName('screen'));
    let currentIndex = 0;
    let startX = null;
    let isTouching = false;
    let lastTranslate = 0;

    function updateScreenPosition(animate = true) {
        screens.forEach((screen, i) => {
            screen.style.transform = `translateX(${(i - currentIndex) * 100}vw)`;
            if (!animate) {
                screen.style.transition = 'none';
            } else {
                screen.style.transition = '';
            }
        });
    }

    // 初期表示
    updateScreenPosition(false);

    // タッチ・マウスイベント
    function onTouchStart(e) {
        isTouching = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        wrapper.classList.add('swiping');
    }
    function onTouchMove(e) {
        if (!isTouching) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const dx = x - startX;
        // 画面を少し動かす
        screens.forEach((screen, i) => {
            screen.style.transition = 'none';
            screen.style.transform = `translateX(${(i - currentIndex) * 100 + dx / window.innerWidth * 100}vw)`;
        });
        lastTranslate = dx;
    }
    function onTouchEnd(e) {
        if (!isTouching) return;
        isTouching = false;
        wrapper.classList.remove('swiping');
        // スワイプ距離で画面切り替え
        if (lastTranslate < -50 && currentIndex < screens.length - 1) {
            currentIndex++;
        } else if (lastTranslate > 50 && currentIndex > 0) {
            currentIndex--;
        }
        updateScreenPosition(true);
        lastTranslate = 0;
    }

    // イベント登録
    wrapper.addEventListener('touchstart', onTouchStart);
    wrapper.addEventListener('touchmove', onTouchMove);
    wrapper.addEventListener('touchend', onTouchEnd);
    wrapper.addEventListener('mousedown', onTouchStart);
    wrapper.addEventListener('mousemove', onTouchMove);
    wrapper.addEventListener('mouseup', onTouchEnd);

    // 画面外クリックでドラッグ解除
    document.body.addEventListener('mouseleave', onTouchEnd);

    // 画面切り替えAPI（他JSからも使えるように）
    window.setScreenIndex = function(idx) {
        if (idx >= 0 && idx < screens.length) {
            currentIndex = idx;
            updateScreenPosition(true);
        }
    };
})();
