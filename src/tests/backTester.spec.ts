/* tslint:disable */
import "jest";
import BaseStrategy from "../core/strategy/baseStrategy";
import {IOrder, OrderSide} from "../core/orderInterface";
import BackTester from "../core/backTester";
import CandleLoader from "../core/candleLoader";
import MyStrategy from "../strategies/myStrategy";
import {CandleInterval, default as HitBTC} from "../core/exchanges/hitBTC";
import {Pair} from "../core/types/pair";
import config from "../config";
import {fromObject, IDataFrame} from "data-forge";
import LocalExchange from "../core/exchanges/localExchange";
import Wallet from "../core/wallet";

// @ts-ignore
const backTester = new BackTester({assets: {USD: 10000}});
const pair: Pair = ["BTC", "USD"];
const wallet = new Wallet({BTC: 1});
const localExchange = LocalExchange.getInstance(wallet);
const emitCandlesMock = jest.fn();

beforeEach(() => {
    backTester.addStrategy({
        strategy: MyStrategy,
        pair: pair,
        interval: CandleInterval.ONE_HOUR,
    });
    localExchange.emitCandles = emitCandlesMock;
    backTester["exchange"] = localExchange;
});


describe("setCandleLoader", () => {
    test("Should set a new candle loader for given path", () => {
        backTester.setCandleLoader("/dir/input/path");
        expect(backTester["candleLoader"]).toEqual(new CandleLoader("/dir/input/path"));
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

        const candleLoader: CandleLoader = new CandleLoader("/dir/input/path/file.csv");
        const parseMock = jest.fn().mockReturnValue(fromObject([]));
        candleLoader.parse = parseMock;
        backTester["candleLoader"] = candleLoader;

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
            exchange: localExchange
        }));
        expect(bindExchangeToStrategySpy).toBeCalledTimes(1);
        expect(bindExchangeToSocketServer).toBeCalledTimes(1);
    });
});
