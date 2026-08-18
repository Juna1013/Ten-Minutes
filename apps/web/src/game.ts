export const TARGET_TIME = 10;

export function calculateDifference(elapsedSeconds: number): number {
    return Math.abs(TARGET_TIME - elapsedSeconds);
}

export function createResultMessage(
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
