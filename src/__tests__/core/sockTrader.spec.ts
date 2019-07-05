/* tslint:disable */
import SimpleMovingAverage from "../../strategies/simpleMovingAverage";
import SockTrader from "../../sockTrader/core/bot/sockTrader";
import {CandleInterval, default as HitBTC} from "../../sockTrader/core/exchanges/hitBTC";
import {Pair} from "../../sockTrader/core/types/pair";

const hitBTC = new HitBTC("PUB_123", "SEC_123");

class ConcreteSockTrader extends SockTrader {
    public exchange = hitBTC;
}

const sockTrader = new ConcreteSockTrader();
const btcEthPair: Pair = ["BTC", "ETH"];
const btcCovPair: Pair = ["BTC", "COV"];

describe("subscribeToExchangeEvents", () => {
    test("Should subscribe to orderbook once with 2 configs: same pair, different interval", () => {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        // sockTrader.addExchange(hitBTC);
        sockTrader.subscribeToExchangeEvents([
            {
                strategy: SimpleMovingAverage,
                pair: btcEthPair,
                interval: CandleInterval.FIVE_MINUTES,
            },
            {
                strategy: SimpleMovingAverage,
                pair: btcEthPair,
                interval: CandleInterval.FOUR_HOURS,
            },
        ]);
        hitBTC.emit("ready");

        expect(mockSubscribeReports).toBeCalledTimes(1);
        expect(mockSubscribeOrderbook).toBeCalledTimes(1);
        expect(mockSubscribeOrderbook).toBeCalledWith(btcEthPair);
        expect(mockSubscribeCandles).toBeCalledTimes(2);
        expect(mockSubscribeCandles).toBeCalledWith(btcEthPair, CandleInterval.FIVE_MINUTES);
        expect(mockSubscribeCandles).toBeCalledWith(btcEthPair, CandleInterval.FOUR_HOURS);

        mockSubscribeReports.mockRestore();
        mockSubscribeOrderbook.mockRestore();
        mockSubscribeCandles.mockRestore();
    });

    test("Should subscribe to orderbook twice with 2 configs: different pair, same interval", () => {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        // sockTrader.addExchange(hitBTC);

        sockTrader.subscribeToExchangeEvents([{
            strategy: SimpleMovingAverage,
            pair: btcEthPair,
            interval: CandleInterval.FIVE_MINUTES,
        },
            {
                strategy: SimpleMovingAverage,
                pair: btcCovPair,
                interval: CandleInterval.FIVE_MINUTES,
            },
        ]);
        hitBTC.emit("ready");

        expect(mockSubscribeReports).toBeCalledTimes(1);
        expect(mockSubscribeOrderbook).toBeCalledTimes(2);
        expect(mockSubscribeOrderbook).toBeCalledWith(btcEthPair);
        expect(mockSubscribeOrderbook).toBeCalledWith(btcCovPair);
        expect(mockSubscribeCandles).toBeCalledTimes(2);
        expect(mockSubscribeCandles).toBeCalledWith(btcEthPair, CandleInterval.FIVE_MINUTES);
        expect(mockSubscribeCandles).toBeCalledWith(btcCovPair, CandleInterval.FIVE_MINUTES);

        mockSubscribeReports.mockRestore();
        mockSubscribeOrderbook.mockRestore();
        mockSubscribeCandles.mockRestore();
    });

    test("Should subscribe to orderbook/candles once with 2 configs: same pair, same interval", () => {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        // sockTrader.addExchange(hitBTC);

        sockTrader.subscribeToExchangeEvents([{
            strategy: SimpleMovingAverage,
            pair: btcEthPair,
            interval: CandleInterval.FIVE_MINUTES,
        },
            {
                strategy: SimpleMovingAverage,
                pair: btcEthPair,
                interval: CandleInterval.FIVE_MINUTES,
            },
        ]);
        hitBTC.emit("ready");

        expect(mockSubscribeReports).toBeCalledTimes(1);
        expect(mockSubscribeOrderbook).toBeCalledTimes(1);
        expect(mockSubscribeOrderbook).toBeCalledWith(btcEthPair);
        expect(mockSubscribeCandles).toBeCalledTimes(1);
        expect(mockSubscribeCandles).toBeCalledWith(btcEthPair, CandleInterval.FIVE_MINUTES);

        mockSubscribeReports.mockRestore();
        mockSubscribeOrderbook.mockRestore();
        mockSubscribeCandles.mockRestore();
    });

});

// describe("addExchange", () => {
//     test("Should add exchange to socketTrader", () => {
// sockTrader.addExchange(hitBTC);
// expect(sockTrader.getExchange()).toBe(hitBTC);
// });
// });

describe("addReporter", () => {
    test("Should add reporter to SockTrader instance", () => {
        const mock = jest.fn();
        const result = sockTrader.addReporter(mock as any);
        expect(result).toEqual(sockTrader);
        expect(sockTrader["reporters"]).toEqual([mock]);
    });
});

describe("bindExchangeToStrategy", () => {
    test("Should bind exchange events to strategy", () => {
        const mockOn = jest.fn();
        hitBTC.on = mockOn;

        sockTrader["bindExchangeToStrategy"](new SimpleMovingAverage(btcEthPair, hitBTC));
        expect(mockOn).toBeCalledWith("app.report", expect.any(Function));
        expect(mockOn).toBeCalledWith("app.updateOrderbook", expect.any(Function));
        expect(mockOn).toBeCalledWith("app.updateCandles", expect.any(Function));
    });
});

describe("bindStrategyToExchange", () => {
    test("Should bind strategy events to exchange", () => {
        const simpleMovingAverage: SimpleMovingAverage = new SimpleMovingAverage(btcEthPair, hitBTC);
        const spyOn = jest.spyOn(simpleMovingAverage, "on");

        sockTrader["bindStrategyToExchange"](simpleMovingAverage);
        expect(spyOn).toBeCalledWith("app.signal", expect.any(Function));
        expect(spyOn).toBeCalledWith("app.adjustOrder", expect.any(Function));
    });
});
