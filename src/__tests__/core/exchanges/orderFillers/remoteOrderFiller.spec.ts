import RemoteOrderFiller from "../../../../sockTrader/core/exchanges/orderFillers/remoteOrderFiller";
import {HitBTCCandleInterval} from "../../../../sockTrader/core/exchanges/hitBTC";
import CandleManager from "../../../../sockTrader/core/candles/candleManager";
import {Candle} from "../../../../sockTrader/core/types/Candle";

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

    test("Should bind updateHandler to 'update' event of newly created CandleManager", () => {
        const manager = orderFiller.getCandleManager(["BTC", "USD"], interval, updateHandler);
        manager.emit("update", {test: 123});
        expect(updateHandler).toBeCalledWith({test: 123});
    });
});

describe("onSnapshotCandles", () => {
    const interval = HitBTCCandleInterval.ONE_MINUTE;

    test("Should set new candles on CandleManager", () => {
        const candles = [{open: 10, high: 20, low: 5, close: 15}] as Candle[];
        const setMock = jest.fn();

        orderFiller.getCandleManager = jest.fn(() => ({set: setMock})) as any;
        orderFiller.onSnapshotCandles(["BTC", "USD"], candles, interval);

        expect(setMock).toBeCalledWith([{"close": 15, "high": 20, "low": 5, "open": 10}]);
    });
});

describe("onUpdateCandles", () => {
    const interval = HitBTCCandleInterval.ONE_MINUTE;

    test("Should update new candles on CandleManager", () => {
        const candles = [{open: 10, high: 20, low: 5, close: 15}] as Candle[];
        const updateMock = jest.fn();

        orderFiller.getCandleManager = jest.fn(() => ({update: updateMock})) as any;
        orderFiller.onUpdateCandles(["BTC", "USD"], candles, interval);

        expect(updateMock).toBeCalledWith([{"close": 15, "high": 20, "low": 5, "open": 10}]);
    });
});


