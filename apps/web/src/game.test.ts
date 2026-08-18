import { describe, expect, it } from "vitest";
import {
    calculateDifference,
    createResultMessage,
} from "./game";

describe("calculateDifference", () => {
    it("10秒なら誤差は0秒になる", () => {
        expect(calculateDifference(10)).toBe(0);
    });

    it("9.8秒なら誤差は0.2秒になる", () => {
        expect(calculateDifference(9.8)).toBeCloseTo(0.2);
    });

    it("10.3秒なら誤差は0.3秒になる", () => {
        expect(calculateDifference(10.3)).toBeCloseTo(0.3);
    });
});

describe("createResultMessage", () => {
    it("誤差0.05秒以下なら神業になる", () => {
        const message = createResultMessage(10.04, 0.04);

        expect(message).toContain("神業！");
        expect(message).toContain("10.04秒");
    });

    it("誤差0.5秒より大きければ再挑戦になる", () => {
        const message = createResultMessage(10.51, 0.51);

        expect(message).toContain("もう1度挑戦！");
    });
});
