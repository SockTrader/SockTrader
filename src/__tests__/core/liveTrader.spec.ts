import HitBTC, {CandleInterval} from "../../sockTrader/core/exchanges/hitBTC";
import LiveTrader from "../../sockTrader/core/bot/liveTrader";
import SimpleMovingAverage from "../../strategies/simpleMovingAverage";
import {IStrategyConfig} from "../../sockTrader/core/bot/sockTrader";
import {IExchange} from "../../sockTrader/core/types/IExchange";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

jest.mock("../../sockTrader/core/logger");

const createExchange = (): IExchange => new HitBTC();
const createStrategy = (): IStrategyConfig => ({
    strategy: SimpleMovingAverage,
    pair: ["BTC", "USD"],
    interval: CandleInterval.ONE_HOUR,
});

const createLiveTrader = (): LiveTrader => {
    const liveTrader = new LiveTrader();
    liveTrader.setExchange(createExchange());
    liveTrader.addStrategy(createStrategy());
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
    test("Should forward strategy events when not using paper trading", async () => {
        const spy = jest.spyOn(LiveTrader.prototype, "bindStrategyToExchange" as any);
        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });
});

describe("setExchange", () => {
    test("Should set the exchange", () => {
        const exchange = createExchange();
        liveTrader.setExchange(exchange);
        expect(liveTrader["exchange"]).toEqual(exchange);
    });
});

describe("start", () => {
    test("Should throw an error if no exchange is found", async () => {
        expect.assertions(1);
        liveTrader["exchange"] = undefined as any;

        await expect(liveTrader.start()).rejects.toThrow("No exchange defined!");
    });

    test("Should subscribe to exchange events", async () => {
        const spy = jest.spyOn(liveTrader, "subscribeToExchangeEvents");

        await liveTrader.start();
        expect(spy).toBeCalledWith([createStrategy()]);
    });

    test("Should connect to exchange", async () => {
        const spy = jest.spyOn(liveTrader["exchange"], "connect");

        await liveTrader.start();
        expect(spy.mock.calls[0]).toEqual([]);
    });

    test("Should bind exchange to strategy events", async () => {
        const spy = jest.spyOn(liveTrader, "bindStrategyToExchange" as any);

        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });

    test("Should bind strategy to exchange events", async () => {
        const spy = jest.spyOn(liveTrader, "bindExchangeToStrategy" as any);

        await liveTrader.start();
        expect(spy).toBeCalledWith(expect.any(SimpleMovingAverage));
    });

    test("Should not bind and connect twice or more", async () => {
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
