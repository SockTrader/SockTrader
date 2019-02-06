/* tslint:disable */
import "jest";
import {fromObject, IDataFrame} from "data-forge";
import {Pair} from "../sockTrader/core/types/pair";
import Wallet from "../sockTrader/core/assets/wallet";
import {CandleInterval} from "../sockTrader/core/exchanges/hitBTC";
import CandleLoader from "../sockTrader/core/candles/candleLoader";
import LocalExchange from "../sockTrader/core/exchanges/localExchange";
import MyStrategy from "../strategies/myStrategy";
import BackTester from "../sockTrader/core/bot/backTester";

// @ts-ignore
const backTester = new BackTester({assets: {USD: 10000}});
const pair: Pair = ["BTC", "USD"];
const wallet = new Wallet({BTC: 1});
const localExchange = LocalExchange.getInstance(wallet);
backTester["exchange"] = localExchange;
const emitCandlesMock = jest.fn();

const candleLoader: CandleLoader = new CandleLoader("/dir/input/path/file.csv");
candleLoader.parse = jest.fn().mockReturnValue(fromObject([]));
backTester.setCandleLoader(candleLoader);
backTester.addStrategy({
    strategy: MyStrategy,
    pair: pair,
    interval: CandleInterval.ONE_HOUR,
});

beforeEach(() => {
    localExchange.emitCandles = emitCandlesMock;
});

afterEach(() => {
    emitCandlesMock.mockRestore();
});


describe("setCandleLoader", () => {
    test("Should set a new candle loader for given path", () => {
        expect(backTester["candleLoader"]).toEqual(candleLoader);
    });
});

describe("start", () => {
    test("Should throw error with no candle loader", async () => {
        try {
            await backTester.start();
        } catch (e) {
            expect(e.toString()).toEqual("Error: No candle loader defined.");
        }
    });

    test("Should bind events if not bound yet", async () => {
        backTester["eventsBound"] = false;
        const subscribeToExchangeEventsMock = jest.fn();
        backTester.subscribeToExchangeEvents = subscribeToExchangeEventsMock;

        const bindStrategyToExchangeSpy = jest.spyOn(backTester, "bindStrategyToExchange" as any);
        const bindExchangeToStrategySpy = jest.spyOn(backTester, "bindExchangeToStrategy" as any);
        const bindExchangeToSocketServer = jest.spyOn(backTester, "bindExchangeToSocketServer" as any);

        await backTester.start();
        expect(subscribeToExchangeEventsMock).toBeCalledWith(expect.arrayContaining([{
            strategy: MyStrategy,
            pair: pair,
            interval: CandleInterval.ONE_HOUR,
        }]));


        expect(bindStrategyToExchangeSpy).toHaveBeenCalledWith(expect.objectContaining({
            pair,
            exchange: localExchange,
        }));
        expect(bindExchangeToStrategySpy).toBeCalledTimes(1);
        expect(bindExchangeToSocketServer).toBeCalledTimes(1);
    });
});