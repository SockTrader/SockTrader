import IPCReporter from "../../../../sockTrader/core/plugins/IPCReporter";
import {isTradingBotAware} from "../../../../sockTrader/core/types/plugins/tradingBotAware";

describe("isTradingBotAware", () => {
    it("Should return true when called with a class that implements TradingBotAware", () => {
        expect(isTradingBotAware(new IPCReporter())).toEqual(true);
    });

    it("Should return false when called with something else", () => {
        expect(isTradingBotAware(false as any)).toEqual(false);
    });
});
