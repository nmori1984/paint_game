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
        this.isRunning = false;
        this.startTime = 0;
        
        this.setupEventListeners();
        this.updateDisplay();
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
            });
        });
    }
    
    setTime(seconds) {
        this.stop();
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
        alert('じかんだよ！');
        this.remainingMilliseconds = 0;
        this.totalMilliseconds = 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const totalSeconds = Math.floor(this.remainingMilliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = this.remainingMilliseconds % 1000;
        
        const displayText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
        this.display.textContent = displayText;
        
        // 残り時間が少ない場合は色を変える
        if (this.remainingMilliseconds <= 10000 && this.remainingMilliseconds > 0) {
            this.display.style.color = '#f44336';
            this.display.style.borderColor = '#f44336';
        } else {
            this.display.style.color = '#1976D2';
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

// 初期化
const timer = new Timer();
