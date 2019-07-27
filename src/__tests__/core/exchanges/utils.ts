import {generateOrderId} from "../../../sockTrader/core/exchanges/utils/utils";

describe("generateOrderId", () => {
    test("Should generate a random order id", () => {
        const result = generateOrderId(["BTC", "USD"]);
        expect(result.length).toEqual(32);
        expect(result).toEqual(expect.any(String));
    });
});
