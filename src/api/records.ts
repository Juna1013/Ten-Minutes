export type SavedRecord = {
    id: number;
    elapsed_time: number;
    difference: number;
    created_at: string;
};

const API_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function saveRecord(
    elapsedTime: number,
): Promise<SavedRecord> {
    const response = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            elapsed_time: elapsedTime,
        }),
    });

    if (!response.ok) {
        throw new Error(`記録の保存に失敗しました: ${response.status}`);
    }

    return response.json() as Promise<SavedRecord>;
}