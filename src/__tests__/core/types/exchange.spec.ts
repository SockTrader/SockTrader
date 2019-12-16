import {isLocalExchange} from "../../../sockTrader/core/types/exchange";
import LocalExchange from "../../../sockTrader/core/exchanges/localExchange";

describe("isLocalExchange", () => {
    it("Should return true when called with a localExchange",() => {
        expect(isLocalExchange(new LocalExchange())).toEqual(true);
    });

    it("Should return false when called with something else",() => {
        expect(isLocalExchange(false as any)).toEqual(false);
    });
});
