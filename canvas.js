// 描画キャンバスの設定と機能
class DrawingCanvas {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 状態管理
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.currentWidth = 2;
        this.isEraser = false;
        
        // 履歴管理（UNDO/REDO用）
        this.history = [];
        this.historyStep = -1;
        
        this.initCanvas();
        this.setupEventListeners();
    }
    
    initCanvas() {
        // キャンバスのサイズを親要素に合わせる
        const section = this.canvas.parentElement;
        const padding = 10; // パディング分を考慮
        this.canvas.width = section.clientWidth - padding;
        this.canvas.height = section.clientHeight - padding;
        
        // 背景を白に設定
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 初期状態を保存
        this.saveState();
        
        // リサイズ時の処理
        window.addEventListener('resize', () => {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.width = section.clientWidth - padding;
            this.canvas.height = section.clientHeight - padding;
            
            // 背景を白に設定
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 以前の描画内容を復元
            this.ctx.putImageData(imageData, 0, 0);
        });
    }
    
    setupEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // タッチイベント（スマホ対応）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // 色選択
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
                this.isEraser = false;
                document.getElementById('eraserBtn').classList.remove('active');
            });
        });
        
        // 線の太さ選択
        document.querySelectorAll('.width-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.width-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentWidth = parseInt(e.target.dataset.width);
            });
        });
        
        // 消しゴム
        document.getElementById('eraserBtn').addEventListener('click', () => {
            this.isEraser = !this.isEraser;
            const eraserBtn = document.getElementById('eraserBtn');
            if (this.isEraser) {
                eraserBtn.classList.add('active');
            } else {
                eraserBtn.classList.remove('active');
            }
        });
        
        // UNDO
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        
        // REDO
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // 全クリア
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('全てクリアしますか?')) {
                this.clearCanvas();
            }
        });
        
        // ダウンロード
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
    }
    
    getCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    startDrawing(event) {
        this.isDrawing = true;
        const coords = this.getCoordinates(event);
        
        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
        
        if (this.isEraser) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = this.currentWidth * 3;
        } else {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentWidth;
        }
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    draw(event) {
        if (!this.isDrawing) return;
        
        const coords = this.getCoordinates(event);
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    saveState() {
        // 現在のステップより後の履歴を削除
        this.history = this.history.slice(0, this.historyStep + 1);
        
        // 現在の状態を保存
        this.history.push(this.canvas.toDataURL());
        this.historyStep++;
        
        // 履歴が50を超えたら古いものから削除
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }
    
    restoreState() {
        const img = new Image();
        img.src = this.history[this.historyStep];
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }
    
    downloadImage() {
        // キャンバスをJPEG形式で保存
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `drawing_${timestamp}.jpg`;
        
        // JPEGに変換（背景を白にする）
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 白い背景を描画
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 描画内容を上に重ねる
        tempCtx.drawImage(this.canvas, 0, 0);
        
        link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }
}

// 初期化
const drawingCanvas = new DrawingCanvas();
