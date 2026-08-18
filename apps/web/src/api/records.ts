import {
    savedRecordSchema,
    type SavedRecord,
} from "../schemas/record";

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
        throw new Error(
            `記録の保存に失敗しました: ${response.status}`,
        );
    }

    const json: unknown = await response.json();
    const result = savedRecordSchema.safeParse(json);

    if (!result.success) {
        console.error(
            "APIレスポンスの検証に失敗しました",
            result.error.issues,
        );

        throw new Error(
            "APIから不正な形式のデータが返されました",
        );
    }

    return result.data;
}
