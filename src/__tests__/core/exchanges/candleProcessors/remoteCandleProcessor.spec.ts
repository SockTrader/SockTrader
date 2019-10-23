import RemoteCandleProcessor from "../../../../sockTrader/core/exchanges/candleProcessors/remoteCandleProcessor";
import {CandleInterval} from "../../../../sockTrader/core/exchanges/hitBTC";
import CandleManager from "../../../../sockTrader/core/candles/candleManager";
import {ICandle} from "../../../../sockTrader/core/types/ICandle";

let candleProcessor = new RemoteCandleProcessor();
beforeEach(() => {
    candleProcessor = new RemoteCandleProcessor();
});

describe("getCandleManager", () => {
    const updateHandler = jest.fn();
    const interval = CandleInterval.ONE_MINUTE;

    test("Should create a new CandleManager", () => {
        const manager = candleProcessor.getCandleManager(["BTC", "USD"], interval, updateHandler);
        expect(manager).toBeInstanceOf(CandleManager);
    });

    test("Should bind updateHandler to 'update' event of newly created CandleManager", () => {
        const manager = candleProcessor.getCandleManager(["BTC", "USD"], interval, updateHandler);
        manager.emit("update", {test: 123});
        expect(updateHandler).toBeCalledWith({test: 123});
    });
});

describe("onSnapshotCandles", () => {
    const interval = CandleInterval.ONE_MINUTE;

    test("Should set new candles on CandleManager", () => {
        const candles = [{open: 10, high: 20, low: 5, close: 15}] as ICandle[];
        const setMock = jest.fn();

        candleProcessor.getCandleManager = jest.fn(() => ({set: setMock})) as any;
        candleProcessor.onSnapshotCandles(["BTC", "USD"], candles, interval);

        expect(setMock).toBeCalledWith([{"close": 15, "high": 20, "low": 5, "open": 10}]);
    });
});

describe("onUpdateCandles", () => {
    const interval = CandleInterval.ONE_MINUTE;

    test("Should update new candles on CandleManager", () => {
        const candles = [{open: 10, high: 20, low: 5, close: 15}] as ICandle[];
        const updateMock = jest.fn();

        candleProcessor.getCandleManager = jest.fn(() => ({update: updateMock})) as any;
        candleProcessor.onUpdateCandles(["BTC", "USD"], candles, interval);

        expect(updateMock).toBeCalledWith([{"close": 15, "high": 20, "low": 5, "open": 10}]);
    });
});


