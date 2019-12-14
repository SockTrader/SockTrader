import {generateOrderId} from "../../../sockTrader/core/utils/utils";

describe("generateOrderId", () => {
    it("Should generate a random order id", () => {
        const result = generateOrderId(["BTC", "USD"]);
        expect(result.length).toEqual(32);
        expect(result).toEqual(expect.any(String));
    });
});
