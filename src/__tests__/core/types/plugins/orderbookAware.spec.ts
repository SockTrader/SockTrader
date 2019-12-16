import SpreadLogger from "../../../../sockTrader/core/plugins/logging/spreadLogger";
import {isOrderbookAware} from "../../../../sockTrader/core/types/plugins/orderbookAware";

describe("isOrderbookAware", () => {
    it("Should return true when called with a class that implements OrderbookAware", () => {
        expect(isOrderbookAware(new SpreadLogger())).toEqual(true);
    });

    it("Should return false when called with something else", () => {
        expect(isOrderbookAware(false as any)).toEqual(false);
    });
});
