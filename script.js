'use strict'

// ゲームで使う値
const TARGET_TIME = 10;
const BEST_RECORD_KEY = "ten-second-game-best";

// HTML要素をJavaScriptから取得できるようにする
const timerElement = document.querySelector("#timer");
const resultElement = document.querySelector("#result");
const bestRecordElement = document.querySelector("#best-record");
const startButton = document.querySelector("#start-button");
const stopButton = document.querySelector("#stop-button");
const resetButton = document.querySelector("#reset-button");

// プレイ中に変化する状態
let startTime = 0;
let timerId = null;
let isRunning = false;

// 画面のタイマー表示を更新する
function updateTimer() {
    const elapsedSeconds = (performance.now() - startTime) / 1000;
    timerElement.textContent = elapsedSeconds.toFixed(2);
}

// スタートボタンを押したときの処理
function startGame() {
    if (isRunning) {
        return;
    }

    isRunning = true;
    startTime = performance.now();
    timerElement.textContent = "0.00";
    resultElement.textContent = "10秒だと思ったらストップ！";

    startButton.disabled = true;
    stopButton.disabled = false;

    timerId = setInterval(updateTimer, 10);
}

// 記録に応じたメッセージを作る
function createResultMessage(elapsedSeconds, difference) {
    let rank;

    if (difference <= 0.05) rank = "神業！";
    else if (difference <= 0.2) rank = "凄い！";
    else if (difference <= 0.5) rank = "惜しい！";
    else rank = "もう1度挑戦！";

    return `${elapsedSeconds.toFixed(2)}秒（誤差${difference.toFixed(2)}秒） ${rank}`;
}

// ベスト記録を必要に応じて更新する
function updateBestRecord(difference) {
    const savedBest = localStorage.getItem(BEST_RECORD_KEY);
    const bestDifference = savedBest === null ? null : Number(savedBest);

    if (bestDifference === null || difference < bestDifference) {
        localStorage.setItem(BEST_RECORD_KEY, String(difference));
        bestRecordElement.textContent = `誤差${difference.toFixed(2)}秒`;
        return;
    }

    bestRecordElement.textContent = `誤差${bestDifference.toFixed(2)}秒`;
}

// ストップボタンを押したときの処理
function stopGame() {
    if (!isRunning) {
        return;
    }

    const elapsedSeconds = (performance.now() - startTime) / 1000;
    const difference = Math.abs(TARGET_TIME - elapsedSeconds);

    clearInterval(timerId);
    isRunning = false;
    timerElement.textContent = elapsedSeconds.toFixed(2);
    resultElement.textContent = createResultMessage(elapsedSeconds, difference);

    startButton.disabled = false;
    stopButton.disabled = true;

    updateBestRecord(difference);
}

// 表示を初期状態へ戻す（ベスト記録は残す）
function resetGame() {
    clearInterval(timerId);
    isRunning = false;
    startTime = 0;

    timerElement.textContent = "0.00";
    resultElement.textContent = "スタートボタンを押してください";
    startButton.disabled = false;
    stopButton.disabled = true;
}

// 保存済みのベスト記録を読み込む
function loadBestRecord() {
    const savedBest = localStorage.getItem(BEST_RECORD_KEY);

    if (savedBest !== null) {
        bestRecordElement.textContent = `誤差${Number(savedBest).toFixed(2)}秒`;
    }
}

// ボタンが押された時に実行する関数を登録する
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);
resetButton.addEventListener("click", resetGame);

loadBestRecord();
