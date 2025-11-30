// カウントダウンタイマーの機能
class Timer {
    constructor() {
        this.display = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        this.totalMilliseconds = 0;
        this.remainingMilliseconds = 0;
        this.intervalId = null;
        this.blinkIntervalId = null;
        this.isRunning = false;
        this.startTime = 0;
        
        this.setupEventListeners();
        
        // 初期値を一番目のボタン（10秒）に設定
        this.lastPresetSeconds = 10;
        this.setTime(10);
    }
    
    setupEventListeners() {
        // 開始ボタン
        this.startBtn.addEventListener('click', () => {
            if (this.remainingMilliseconds > 0) {
                this.start();
            }
        });
        
        // 停止ボタン
        this.stopBtn.addEventListener('click', () => {
            this.stop();
        });
        
        // プリセットボタン
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.target.dataset.seconds);
                this.setTime(seconds);
                window.timer.lastPresetSeconds = seconds;
            });
        });
    }
    
    setTime(seconds) {
        this.stop();
        this.stopBlinking();
        this.totalMilliseconds = seconds * 1000;
        this.remainingMilliseconds = seconds * 1000;
        this.updateDisplay();
    }
    
    start() {
        if (this.isRunning) return;
        if (this.remainingMilliseconds <= 0) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.startTime = Date.now();
        
        this.intervalId = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.remainingMilliseconds = Math.max(0, this.totalMilliseconds - elapsed);
            this.updateDisplay();
            
            if (this.remainingMilliseconds <= 0) {
                this.finish();
            }
        }, 10);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    finish() {
        this.stop();
        this.playSound();
        // アラートを表示せず、タイマー表示を点滅させる
        this.remainingMilliseconds = 0;
        this.totalMilliseconds = 0;
        this.updateDisplay();
        
        // タイマー表示を点滅させる
        this.startBlinking();
        
        // ページ背景を薄い赤に変更（複数の要素に適用）
        document.body.style.backgroundColor = '#ffcccc';
        const container = document.querySelector('.container');
        if (container) {
            container.style.backgroundColor = '#ffcccc';
        }
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.backgroundColor = '#ffcccc';
        });
    }
    
    startBlinking() {
        // 既に点滅中なら停止
        if (this.blinkIntervalId) {
            clearInterval(this.blinkIntervalId);
        }
        
        let isVisible = true;
        this.blinkIntervalId = setInterval(() => {
            if (isVisible) {
                this.display.style.opacity = '0.3';
            } else {
                this.display.style.opacity = '1';
            }
            isVisible = !isVisible;
        }, 500);
    }
    
    stopBlinking() {
        if (this.blinkIntervalId) {
            clearInterval(this.blinkIntervalId);
            this.blinkIntervalId = null;
            this.display.style.opacity = '1';
        }
        // 背景色を元に戻す
        document.body.style.backgroundColor = '';
        const container = document.querySelector('.container');
        if (container) {
            container.style.backgroundColor = '';
        }
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.backgroundColor = '';
        });
    }
    
    updateDisplay() {
        const totalSeconds = Math.floor(this.remainingMilliseconds / 1000);
        const seconds = totalSeconds;
        const milliseconds = this.remainingMilliseconds % 1000;
        
        const displayText = `${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
        this.display.textContent = displayText;
        
        // 残り時間に応じて色を変える
        if (this.remainingMilliseconds <= 0) {
            // 0秒：濃い赤（点滅時）
            this.display.style.color = '#ffffff';
            this.display.style.backgroundColor = '#d32f2f';
            this.display.style.borderColor = '#d32f2f';
        } else if (this.remainingMilliseconds <= 10000) {
            // 10秒未満：オレンジ
            this.display.style.color = '#ff6f00';
            this.display.style.backgroundColor = '#e3f2fd';
            this.display.style.borderColor = '#ff6f00';
        } else {
            // 10秒以上：青
            this.display.style.color = '#1976D2';
            this.display.style.backgroundColor = '#e3f2fd';
            this.display.style.borderColor = '#2196F3';
        }
    }
    
    playSound() {
        // ビープ音を生成（Web Audio API使用）
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('音声再生に失敗しました:', error);
        }
    }
}

// 初期化（グローバルスコープに登録）
window.timer = new Timer();
