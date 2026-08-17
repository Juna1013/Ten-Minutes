'use strict'

// ゲームで使う値
const TARGET_TIME: number = 10;
const BEST_RECORD_KEY: string = "ten-second-game-best";

// querySelector の戻り値は「要素 または null」になるため、見つかった要素だけを返す関数を用意する
function getElement<T extends Element>(selector: string): T {
    const element: T | null = document.querySelector<T>(selector);

    if (element === null) {
        throw new Error(`${selector}に一致するHTML要素が見つかりません`);
    }

    return element;
}

const timerElement = getElement<HTMLParagraphElement>("#timer");
const resultElement = getElement<HTMLParagraphElement>("#result");
const bestRecordElement = getElement<HTMLParagraphElement>("#best-record");
const startButton = getElement<HTMLButtonElement>("#start-button");
const stopButton = getElement<HTMLButtonElement>("#stop-button");
const resetButton = getElement<HTMLButtonElement>("#reset-button");

// プレイ中に変化する状態
let startTime: number = 0;
let timerId: number | null = null;
let isRunning: boolean = false;

// 動いているタイマーを停止する
function clearTimer(): void {
    if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
    }
}

// 画面のタイマー表示を更新する
function updateTimer(): void {
    const elapsedSeconds: number = (performance.now() - startTime) / 1000;
    timerElement.textContent = elapsedSeconds.toFixed(2);
}

// スタートボタンを押したときの処理
function startGame(): void {
    if (isRunning) {
        return;
    }

    isRunning = true;
    startTime = performance.now();
    timerElement.textContent = "0.00";
    resultElement.textContent = "10秒だと思ったらストップ！";

    startButton.disabled = true;
    stopButton.disabled = false;

    timerId = window.setInterval(updateTimer, 10);
}

// 記録に応じたメッセージを作る
function createResultMessage(
    elapsedSeconds: number,
    difference: number,
): string {
    let rank: string;

    if (difference <= 0.05) rank = "神業！";
    else if (difference <= 0.2) rank = "すごい！";
    else if (difference <= 0.5) rank = "惜しい！";
    else rank = "もう1度挑戦！";

    return `${elapsedSeconds.toFixed(2)}秒（誤差${difference.toFixed(2)}秒） ${rank}`;
}

// 保存済みの値を number型 として安全に取得する
function getSavedBestRecord(): number | null {
    const savedBest: string | null = localStorage.getItem(BEST_RECORD_KEY);

    if (savedBest === null) {
        return null;
    }

    const parsedBest: number = Number(savedBest);
    return Number.isFinite(parsedBest) ? parsedBest : null;
}

// ベスト記録を必要に応じて更新する
function updateBestRecord(difference: number): void {
    const bestDifference: number | null = getSavedBestRecord();

    if (bestDifference === null || difference < bestDifference) {
        localStorage.setItem(BEST_RECORD_KEY, String(difference));
        bestRecordElement.textContent = `誤差${difference.toFixed(2)}`;
        return;
    }

    bestRecordElement.textContent = `誤差${bestDifference.toFixed(2)}秒`;
}

// ストップボタンを押したときの処理
function stopGame(): void {
    if (!isRunning) {
        return;
    }

    const elapsedSeconds: number = (performance.now() - startTime) / 1000;
    const difference: number = Math.abs(TARGET_TIME - elapsedSeconds);

    clearTimer();
    isRunning = false;
    timerElement.textContent = elapsedSeconds.toFixed(2);
    resultElement.textContent = createResultMessage(elapsedSeconds, difference);

    startButton.disabled = false;
    stopButton.disabled = true;

    updateBestRecord(difference);
}

// 表示を初期状態へ戻す（ベスト記録は残す）
function resetGame(): void {
    clearTimer();
    isRunning = false;
    startTime = 0;

    timerElement.textContent = "0.00";
    resultElement.textContent = "スタートボタンを押してください";
    startButton.disabled = false;
    stopButton.disabled = true;
}

// 保存済みのベスト記録を読み込む
function loadBestRecord(): void {
    const savedBest: number | null = getSavedBestRecord();

    if (savedBest !== null) {
        bestRecordElement.textContent = `誤差${savedBest.toFixed(2)}秒`;
    }
}

// ボタンが押されたときに実行する関数を登録する
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);
resetButton.addEventListener("click", resetGame);

loadBestRecord();
