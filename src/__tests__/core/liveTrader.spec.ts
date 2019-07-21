import HitBTC, {CandleInterval} from "../../sockTrader/core/exchanges/hitBTC";
import LiveTrader from "../../sockTrader/core/bot/liveTrader";
import SimpleMovingAverage from "../../strategies/simpleMovingAverage";
import {IStrategyConfig} from "../../sockTrader/core/bot/sockTrader";
import {IExchange} from "../../sockTrader/core/types/IExchange";
import {IReporter} from "../../sockTrader/core/reporters/reporterInterface";
import IPCReporter from "../../sockTrader/core/reporters/IPCReporter";
import logger from "../../sockTrader/core/logger";
import {EventEmitter} from "events";
import BaseStrategy from "../../sockTrader/core/strategy/baseStrategy";

jest.mock("../../sockTrader/core/logger");

const createReporter = (): IReporter => new IPCReporter();
const createExchange = (): IExchange => new HitBTC();
const createStrategy = (): IStrategyConfig => ({
    strategy: SimpleMovingAverage,
    pair: ["BTC", "USD"],
    interval: CandleInterval.ONE_HOUR,
});

const createLiveTrader = (paperTrading: boolean = false): LiveTrader => {
    const liveTrader = new LiveTrader(paperTrading);
    liveTrader.setExchange(createExchange());
    liveTrader.addStrategy(createStrategy());
    liveTrader.addReporter(createReporter());
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

    test("Should log strategy events when using paper trading", () => {
        const liveTrader = createLiveTrader(true);
        const eventEmitter = new EventEmitter();

        liveTrader["bindStrategyToExchange"](eventEmitter as BaseStrategy);
        eventEmitter.emit("core.signal", {order: 123})
        eventEmitter.emit("core.adjustOrder", {order: 123})

        expect(logger.info).toHaveBeenNthCalledWith(1, "[PT] ORDER: {\"order\":123}");
        expect(logger.info).toHaveBeenNthCalledWith(2, "[PT] ADJUST: {\"order\":123}");
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

    test("Should bind reporters to exchange events", async () => {
        const spy = jest.spyOn(liveTrader, "bindExchangeToReporters" as any);

        await liveTrader.start();
        expect(spy).toBeCalledWith([createReporter()]);
    });

    test("Should not bind and connect twice or more", async () => {
        const subscribeToExchangeEvents = jest.spyOn(liveTrader, "subscribeToExchangeEvents" as any);
        const bindStrategyToExchange = jest.spyOn(liveTrader, "bindStrategyToExchange" as any);
        const bindExchangeToStrategy = jest.spyOn(liveTrader, "bindExchangeToStrategy" as any);
        const bindExchangeToReporters = jest.spyOn(liveTrader, "bindExchangeToReporters" as any);
        const connect = jest.spyOn(liveTrader["exchange"], "connect");

        await liveTrader.start();
        await liveTrader.start();

        expect(subscribeToExchangeEvents).toBeCalledTimes(1);
        expect(bindStrategyToExchange).toBeCalledTimes(1);
        expect(bindExchangeToStrategy).toBeCalledTimes(1);
        expect(bindExchangeToReporters).toBeCalledTimes(1);
        expect(connect).toBeCalledTimes(1);
    });
});
