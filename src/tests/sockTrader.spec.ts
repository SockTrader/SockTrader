/* tslint:disable */
import MyStrategy from "../strategies/myStrategy";
import {IExchange} from "../core/exchanges/exchangeInterface";
import SockTrader from "../core/sockTrader";
import {CandleInterval, default as HitBTC} from "../core/exchanges/hitBTC";
import {Pair} from "../types/pair";

class ConcreteSockTrader extends SockTrader {

    addExchange(exchange: IExchange): this {
        this.exchange = exchange;

        return this;
    }

    getExchange(): IExchange {
        return this.exchange;
    }
}

const hitBTC = new HitBTC("PUB_123", "SEC_123");
const sockTrader = new ConcreteSockTrader();
const btcEthPair : Pair = ["BTC", "ETH"];
const btcCovPair : Pair = ["BTC", "COV"];


describe("subscribeToExchangeEvents", () => {
    test("Should subscribe to orderbook once with 2 configs: same pair, different interval", function () {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        sockTrader.addExchange(hitBTC);
        sockTrader.subscribeToExchangeEvents([{
            strategy: MyStrategy,
            pair: btcEthPair,
            interval: CandleInterval.FIVE_MINUTES,
        },
            {
                strategy: MyStrategy,
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

    test("Should subscribe to orderbook twice with 2 configs: different pair, same interval", function () {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        sockTrader.addExchange(hitBTC);
        
        sockTrader.subscribeToExchangeEvents([{
            strategy: MyStrategy,
            pair:btcEthPair,
            interval: CandleInterval.FIVE_MINUTES,
        },
            {
                strategy: MyStrategy,
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

    test("Should subscribe to orderbook/candles once with 2 configs: same pair, same interval", function () {
        const mockSubscribeReports = jest.fn();
        const mockSubscribeOrderbook = jest.fn();
        const mockSubscribeCandles = jest.fn();

        hitBTC.subscribeReports = mockSubscribeReports;
        hitBTC.subscribeOrderbook = mockSubscribeOrderbook;
        hitBTC.subscribeCandles = mockSubscribeCandles;

        sockTrader.addExchange(hitBTC);

        sockTrader.subscribeToExchangeEvents([{
            strategy: MyStrategy,
            pair: btcEthPair,
            interval: CandleInterval.FIVE_MINUTES,
        },
            {
                strategy: MyStrategy,
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

describe("addExchange", () => {
    test("Should add exchange to socketTrader", function () {
        sockTrader.addExchange(hitBTC);
        expect(sockTrader.getExchange()).toBe(hitBTC);
    });
});

describe("bindExchangeToStrategy", () => {
    test("Should bind exchange events to strategy", function () {
        const mockOn = jest.fn();
        hitBTC.on = mockOn;

        sockTrader.addExchange(hitBTC);
        sockTrader["bindExchangeToStrategy"](new MyStrategy(btcEthPair, hitBTC));
        expect(mockOn).toBeCalledWith("app.report", expect.anything());
        expect(mockOn).toBeCalledWith("app.updateOrderbook", expect.anything());
        expect(mockOn).toBeCalledWith("app.updateCandles", expect.anything());
    });
});

describe("bindStrategyToExchange", () => {
    test("Should bind strategy events to exchange", function () {
        const mockOn = jest.fn();
        hitBTC.on = mockOn;
        const myStrategy: MyStrategy = new MyStrategy(btcEthPair, hitBTC);
        const spyOn = jest.spyOn(myStrategy, "on");

        sockTrader["bindStrategyToExchange"](myStrategy);
        expect(spyOn).toBeCalledWith("app.signal", expect.anything());
        expect(spyOn).toBeCalledWith("app.adjustOrder", expect.anything());
    });
});

describe("sendToSocketServer", () => {
    test("Should broadcast payload to socket server", function () {
        const mockOn = jest.fn();
        hitBTC.on = mockOn;
        const myStrategy: MyStrategy = new MyStrategy(btcEthPair, hitBTC);
        const spyOn = jest.spyOn(myStrategy, "on");

        sockTrader["bindStrategyToExchange"](myStrategy);
        expect(spyOn).toBeCalledWith("app.signal", expect.anything());
        expect(spyOn).toBeCalledWith("app.adjustOrder", expect.anything());
    });
});
