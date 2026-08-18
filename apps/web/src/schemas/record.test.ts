import { describe, expect, it } from "vitest";
import { savedRecordSchema } from "./record";

describe("savedRecordSchema", () => {
    it("正しい記録データを受け入れる", () => {
        const result = savedRecordSchema.safeParse({
            id: 1,
            elapsed_time: 10.03,
            difference: 0.03,
            created_at: "2026-08-18T08:00:00+00:00",
        });

        expect(result.success).toBe(true);
    });

    it("FastAPIが実際に返す形式を受け入れる", () => {
        const result = savedRecordSchema.safeParse({
            id: 1,
            elapsed_time: 9.98,
            difference: 0.019999999999999574,
            created_at: "2026-08-18T11:26:24.506324+00:00",
        });

        expect(result.success).toBe(true);
    });

    it("タイムゾーンのない日時を拒否する", () => {
        const result = savedRecordSchema.safeParse({
            id: 1,
            elapsed_time: 9.98,
            difference: 0.02,
            created_at: "2026-08-18T11:26:24.506324",
        });

        expect(result.success).toBe(false);
    });

    it("idが文字列なら拒否する", () => {
        const result = savedRecordSchema.safeParse({
            id: "1",
            elapsed_time: 10.03,
            difference: 0.03,
            created_at: "2026-08-18T08:00:00+00:00",
        });

        expect(result.success).toBe(false);
    });

    it("elapsed_timeが60秒を超えたら拒否する", () => {
        const result = savedRecordSchema.safeParse({
            id: 1,
            elapsed_time: 61,
            difference: 51,
            created_at: "2026-08-18T08:00:00+00:00",
        });

        expect(result.success).toBe(false);
    });

    it("不正な日時を拒否する", () => {
        const result = savedRecordSchema.safeParse({
            id: 1,
            elapsed_time: 10,
            difference: 0,
            created_at: "昨日",
        });

        expect(result.success).toBe(false);
    });
});