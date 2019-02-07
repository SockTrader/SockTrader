/* tslint:disable */
import "jest";
import {fromObject, IDataFrame} from "data-forge";
import {Pair} from "../sockTrader/core/types/pair";
import Wallet from "../sockTrader/core/assets/wallet";
import {CandleInterval, default as HitBTC} from "../sockTrader/core/exchanges/hitBTC";
import CandleLoader from "../sockTrader/core/candles/candleLoader";
import LocalExchange from "../sockTrader/core/exchanges/localExchange";
import MyStrategy from "../strategies/myStrategy";
import BackTester from "../sockTrader/core/bot/backTester";
import LiveTrader from "../sockTrader/core/bot/liveTrader";

// @ts-ignore
const liveTrader = new LiveTrader({webServer: false});
const pair: Pair = ["BTC", "USD"];

const hitBTC = HitBTC.getInstance();
liveTrader.addExchange(hitBTC);
liveTrader.addStrategy({
    strategy: MyStrategy,
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
        const bindExchangeToSocketServer = jest.spyOn(liveTrader, "bindExchangeToSocketServer" as any);

        await liveTrader.start();
        expect(subscribeToExchangeEventsMock).toBeCalledWith(expect.arrayContaining([{
            strategy: MyStrategy,
            pair: pair,
            interval: CandleInterval.ONE_HOUR,
        }]));

        expect(bindStrategyToExchangeSpy).toHaveBeenCalledWith(expect.objectContaining({
            pair,
            exchange: hitBTC,
        }));
        expect(liveTrader["eventsBound"]).toEqual(true);
        expect(bindExchangeToStrategySpy).toBeCalledTimes(1);
        expect(bindExchangeToSocketServer).toBeCalledTimes(1);
        expect(connectMock).toBeCalledTimes(1);
    });
});