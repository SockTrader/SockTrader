/* tslint:disable */
import "jest";
import {Pair} from "../../sockTrader/core/types/pair";
import {CandleInterval, default as HitBTC} from "../../sockTrader/core/exchanges/hitBTC";
import LiveTrader from "../../sockTrader/core/bot/liveTrader";
import SimpleMovingAverage from "../../strategies/simpleMovingAverage";

// @ts-ignore
const liveTrader = new LiveTrader({webServer: false});
const pair: Pair = ["BTC", "USD"];

const hitBTC = HitBTC.getInstance();
liveTrader.addExchange(hitBTC);
liveTrader.addStrategy({
    strategy: SimpleMovingAverage,
    pair: pair,
    interval: CandleInterval.ONE_HOUR,
});

const connectMock = jest.fn();
beforeEach(() => {
    hitBTC["connect"] = connectMock;
});

afterEach(() => {
    connectMock.mockRestore();
});


describe("addExchange", () => {
    test("Should add the exchange", () => {
        expect(liveTrader["exchange"]).toEqual(hitBTC);
    });
});

describe("start", () => {
    test("Should throw an error if no exchange is found", async () => {
        try {
            await liveTrader.start();
        } catch (e) {
            expect(e.toString()).toEqual("Error: No candle loader defined.");
        }
    });

    test("Should bind events if not bound yet", async () => {
        liveTrader["eventsBound"] = false;
        const subscribeToExchangeEventsMock = jest.fn();
        liveTrader.subscribeToExchangeEvents = subscribeToExchangeEventsMock;

        const bindStrategyToExchangeSpy = jest.spyOn(liveTrader, "bindStrategyToExchange" as any);
        const bindExchangeToStrategySpy = jest.spyOn(liveTrader, "bindExchangeToStrategy" as any);
        const bindExchangeToReporters = jest.spyOn(liveTrader, "bindExchangeToReporters" as any);

        await liveTrader.start();
        expect(subscribeToExchangeEventsMock).toBeCalledWith(expect.arrayContaining([{
            strategy: SimpleMovingAverage,
            pair: pair,
            interval: CandleInterval.ONE_HOUR,
        }]));

        expect(bindStrategyToExchangeSpy).toHaveBeenCalledWith(expect.objectContaining({
            pair,
            exchange: hitBTC,
        }));
        expect(liveTrader["eventsBound"]).toEqual(true);
        expect(bindExchangeToStrategySpy).toBeCalledTimes(1);
        expect(bindExchangeToReporters).toBeCalledTimes(1);
        expect(connectMock).toBeCalledTimes(1);
    });
});
