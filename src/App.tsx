import { useEffect, useRef, useState } from "react";
import "./App.css";

// ゲームで使う値
const TARGET_TIME = 10;
const BEST_RECORD_KEY = "ten-second-game-best";

// 保存済みの値を number型 として安全に取得する
function getSavedBestRecord(): number | null {
    const savedBest = localStorage.getItem(BEST_RECORD_KEY);

    if (savedBest === null) {
        return null;
    }

    const parsedBest = Number(savedBest);
    return Number.isFinite(parsedBest) ? parsedBest : null;
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

function App() {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState("スタートボタンを押してください");
    const [bestRecord, setBestRecord] = useState<number | null>(null);

    // 表示に使わない値はrefで持つ（更新しても再描画しない）
    const startTimeRef = useRef(0);
    const timerIdRef = useRef<number | null>(null);

    // 動いているタイマーを停止する
    function clearTimer(): void {
        if (timerIdRef.current !== null) {
            window.clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        }
    }

    // 保存済みのベスト記録を読み込む（初回のみ）
    useEffect(() => {
        setBestRecord(getSavedBestRecord());
    }, []);

    // 画面から離れるときにタイマーを止める
    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, []);

    // スタートボタンを押したときの処理
    function startGame(): void {
        if (isRunning) {
            return;
        }

        setIsRunning(true);
        setElapsedSeconds(0);
        setResult("10秒だと思ったらストップ！");

        startTimeRef.current = performance.now();
        timerIdRef.current = window.setInterval(() => {
            setElapsedSeconds((performance.now() - startTimeRef.current) / 1000);
        }, 10);
    }

    // ストップボタンを押したときの処理
    function stopGame(): void {
        if (!isRunning) {
            return;
        }

        const stoppedSeconds = (performance.now() - startTimeRef.current) / 1000;
        const difference = Math.abs(TARGET_TIME - stoppedSeconds);

        clearTimer();
        setIsRunning(false);
        setElapsedSeconds(stoppedSeconds);
        setResult(createResultMessage(stoppedSeconds, difference));

        // ベスト記録を必要に応じて更新する
        const savedBest = getSavedBestRecord();

        if (savedBest === null || difference < savedBest) {
            localStorage.setItem(BEST_RECORD_KEY, String(difference));
            setBestRecord(difference);
        }
    }

    // 表示を初期状態へ戻す（ベスト記録は残す）
    function resetGame(): void {
        clearTimer();
        setIsRunning(false);
        setElapsedSeconds(0);
        setResult("スタートボタンを押してください");
        startTimeRef.current = 0;
    }

    return (
        <main className="game-card">
            <p className="eyebrow">TIME CHALLENGE</p>
            <h1>10秒ぴったりストップ</h1>
            <p className="description">
                スタートを押して、10秒だと思った瞬間にストップ！
            </p>

            <section className="timer-area" aria-live="polite">
                <p className="timer-label">経過時間</p>
                <p className="timer">{elapsedSeconds.toFixed(2)}</p>
                <p className="unit">秒</p>
            </section>

            <div className="buttons">
                <button
                    className="button button-start"
                    type="button"
                    onClick={startGame}
                    disabled={isRunning}
                >
                    スタート
                </button>
                <button
                    className="button button-stop"
                    type="button"
                    onClick={stopGame}
                    disabled={!isRunning}
                >
                    ストップ
                </button>
                <button
                    className="button button-reset"
                    type="button"
                    onClick={resetGame}
                >
                    リセット
                </button>
            </div>

            <section className="result-area" aria-live="polite">
                <p className="result">{result}</p>
                <p className="best-record">
                    ベスト記録：
                    <span>
                        {bestRecord === null
                            ? "--"
                            : `誤差${bestRecord.toFixed(2)}秒`}
                    </span>
                </p>
            </section>
        </main>
    );
}

export default App;
