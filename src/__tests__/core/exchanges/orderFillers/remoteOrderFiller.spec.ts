import RemoteOrderFiller from "../../../../sockTrader/core/exchanges/orderFillers/remoteOrderFiller";
import {HitBTCCandleInterval} from "../../../../sockTrader/core/exchanges/hitBTC";
import CandleManager from "../../../../sockTrader/core/candles/candleManager";
import Events from "../../../../sockTrader/core/events";
import {FX_HISTORICAL_CANDLES} from "../../../../__fixtures__/candles";

let orderFiller = new RemoteOrderFiller();
beforeEach(() => {
    orderFiller = new RemoteOrderFiller();
});

describe("getCandleManager", () => {
    const updateHandler = jest.fn();
    const interval = HitBTCCandleInterval.ONE_MINUTE;

    test("Should create a new CandleManager", () => {
        const manager = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);
        expect(manager).toBeInstanceOf(CandleManager);
    });

    test("Should return same CandleManager instance when calling multiple times", () => {
        const manager1 = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);
        const manager2 = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);
        const manager3 = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);

        expect(manager1).toStrictEqual(manager2);
        expect(manager2).toStrictEqual(manager3);
    });

    test("Should bind updateHandler to 'update' event of newly created CandleManager", () => {
        const manager = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);
        manager.emit("update", {test: 123});
        expect(updateHandler).toBeCalledWith({test: 123});
    });
});

describe("onSnapshotCandles", () => {
    const interval = HitBTCCandleInterval.ONE_MINUTE;

    test("Should set new candles on CandleManager", () => {
        const emitSpy = jest.spyOn(Events, "emit");
        orderFiller.onSnapshotCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);

        expect(emitSpy).toBeCalledWith("core.updateCandles", expect.arrayContaining([
            expect.objectContaining({
                open: 100,
                high: 110,
                low: 99,
                close: 102,
                volume: 1000,
            }),
        ]));
    });
});

describe("onUpdateCandles", () => {
    const interval = HitBTCCandleInterval.ONE_MINUTE;

    test("Should update new candles on CandleManager", () => {
        const emitSpy = jest.spyOn(Events, "emit");
        orderFiller.onUpdateCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);

        expect(emitSpy).toBeCalledWith("core.updateCandles", expect.arrayContaining([
            expect.objectContaining({
                open: 100,
                high: 110,
                low: 99,
                close: 102,
                volume: 1000,
            }),
        ]));
    });
});


