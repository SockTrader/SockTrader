import HitBTC, {HitBTCCandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import LiveTrader from "../../../sockTrader/core/bot/liveTrader";
import SimpleMovingAverage from "../../../strategies/simpleMovingAverage";
import {StrategyConfig} from "../../../sockTrader/core/bot/sockTrader";
import {Exchange} from "../../../sockTrader/core/types/exchange";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

jest.mock("../../../sockTrader/core/loggerFactory");

const createExchange = (): Exchange => new HitBTC();
const createStrategy = (): StrategyConfig => ({
    strategy: SimpleMovingAverage,
    pair: ["BTC", "USD"],
    interval: HitBTCCandleInterval.ONE_HOUR,
});

const createLiveTrader = (): LiveTrader => {
    const liveTrader = new LiveTrader();
    liveTrader.setExchange(createExchange());
    liveTrader.setStrategy(createStrategy());
    return liveTrader;
};

let liveTrader = createLiveTrader();
beforeEach(() => {
    liveTrader = createLiveTrader();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("bindStrategyToExchange", () => {
    it("Should forward strategy events when not using paper trading", async () => {
        const spy = jest.spyOn(LiveTrader.prototype, "bindStrategyToExchange" as any);
        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });
});

describe("setExchange", () => {
    it("Should set the exchange", () => {
        const exchange = createExchange();
        liveTrader.setExchange(exchange);
        expect(liveTrader["exchange"]).toEqual(exchange);
    });
});

describe("start", () => {
    it("Should throw an error if no exchange is found", async () => {
        expect.assertions(1);
        liveTrader["exchange"] = undefined as any;

        await expect(liveTrader.start()).rejects.toThrow("SockTrader should have at least 1 strategy and at least 1 exchange.");
    });

    it("Should subscribe to exchange events", async () => {
        const spy = jest.spyOn(liveTrader, "subscribeToExchangeEvents");

        await liveTrader.start();
        expect(spy).toBeCalledWith(createStrategy());
    });

    it("Should connect to exchange", async () => {
        const spy = jest.spyOn(liveTrader["exchange"], "connect");

        await liveTrader.start();
        expect(spy.mock.calls[0]).toEqual([]);
    });

    it("Should bind exchange to strategy events", async () => {
        const spy = jest.spyOn(liveTrader, "bindStrategyToExchange" as any);

        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });

    it("Should bind strategy to exchange events", async () => {
        const spy = jest.spyOn(liveTrader, "bindExchangeToStrategy" as any);

        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });

    it("Should not bind and connect twice or more", async () => {
        const subscribeToExchangeEvents = jest.spyOn(liveTrader, "subscribeToExchangeEvents" as any);
        const bindStrategyToExchange = jest.spyOn(liveTrader, "bindStrategyToExchange" as any);
        const bindExchangeToStrategy = jest.spyOn(liveTrader, "bindExchangeToStrategy" as any);
        const connect = jest.spyOn(liveTrader["exchange"], "connect");

        await liveTrader.start();
        await liveTrader.start();

        expect(subscribeToExchangeEvents).toBeCalledTimes(1);
        expect(bindStrategyToExchange).toBeCalledTimes(1);
        expect(bindExchangeToStrategy).toBeCalledTimes(1);
        expect(connect).toBeCalledTimes(1);
    });
});
