// お題ルーレットの機能
class Roulette {
    constructor() {
        this.topics = [];
        this.display = document.getElementById('rouletteDisplay');
        this.button = document.getElementById('rouletteBtn');
        this.editBtn = document.getElementById('editTopicsBtn');
        this.modal = document.getElementById('editModal');
        this.textarea = document.getElementById('topicsTextarea');
        this.saveBtn = document.getElementById('saveTopicsBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeBtn = document.getElementById('closeModal');
        this.isSpinning = false;
        
        this.loadTopics();
        this.setupEventListener();
    }
    
    async loadTopics() {
        // LocalStorageから読み込みを試みる
        const savedTopics = localStorage.getItem('rouletteTopics');
        if (savedTopics) {
            try {
                this.topics = JSON.parse(savedTopics);
                if (this.topics.length > 0) {
                    return;
                }
            } catch (error) {
                console.error('LocalStorageからの読み込みに失敗しました:', error);
            }
        }
        
        // LocalStorageになければroulette.txtから読み込み
        try {
            const response = await fetch('roulette.txt');
            const text = await response.text();
            
            // 改行で分割して空行を除外
            this.topics = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            if (this.topics.length === 0) {
                this.topics = ['お題が読み込めませんでした'];
            }
        } catch (error) {
            console.error('お題ファイルの読み込みに失敗しました:', error);
            // デフォルトのお題
            this.topics = [
                'りんご', 'ねこ', 'いえ', 'くるま', 'はな',
                'とり', 'やま', 'うみ', 'ほし', 'たいよう'
            ];
        }
    }
    
    setupEventListener() {
        this.button.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.spin();
            }
        });
        
        // 編集ボタン
        this.editBtn.addEventListener('click', () => {
            this.openEditModal();
        });
        
        // モーダルを閉じる
        this.closeBtn.addEventListener('click', () => {
            this.closeEditModal();
        });
        
        this.cancelBtn.addEventListener('click', () => {
            this.closeEditModal();
        });
        
        // モーダル外クリックで閉じる
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeEditModal();
            }
        });
        
        // 保存ボタン
        this.saveBtn.addEventListener('click', () => {
            this.saveTopics();
        });
    }
    
    openEditModal() {
        // 現在のお題リストをテキストエリアに表示
        this.textarea.value = this.topics.join('\n');
        this.modal.style.display = 'block';
    }
    
    closeEditModal() {
        this.modal.style.display = 'none';
    }
    
    saveTopics() {
        // テキストエリアの内容を読み込んで更新
        const text = this.textarea.value;
        this.topics = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        if (this.topics.length === 0) {
            alert('お題を最低1つは入力してください');
            return;
        }
        
        // LocalStorageに保存
        localStorage.setItem('rouletteTopics', JSON.stringify(this.topics));
        
        this.closeEditModal();
        alert(`${this.topics.length}個のお題を保存しました`);
    }
    
    spin() {
        this.isSpinning = true;
        this.button.disabled = true;
        this.display.classList.add('spinning');
        
        let spinCount = 0;
        const maxSpins = 20; // 高速で切り替える回数
        const spinInterval = 100; // 切り替え間隔（ミリ秒）
        
        const intervalId = setInterval(() => {
            // ランダムにお題を表示
            const randomIndex = Math.floor(Math.random() * this.topics.length);
            this.display.textContent = this.topics[randomIndex];
            
            spinCount++;
            
            if (spinCount >= maxSpins) {
                clearInterval(intervalId);
                this.finishSpin();
            }
        }, spinInterval);
    }
    
    finishSpin() {
        // 最終的なお題を決定
        const finalIndex = Math.floor(Math.random() * this.topics.length);
        this.display.textContent = this.topics[finalIndex];
        
        this.display.classList.remove('spinning');
        this.isSpinning = false;
        this.button.disabled = false;
    }
}

// 初期化
const roulette = new Roulette();
