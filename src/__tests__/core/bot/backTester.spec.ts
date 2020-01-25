import {Pair} from "../../../sockTrader/core/types/pair";
import {HitBTCCandleInterval} from "../../../sockTrader/core/exchange/hitBTC";
import LocalExchange from "../../../sockTrader/core/exchange/localExchange";
import BackTester from "../../../sockTrader/core/bot/backTester";
import SimpleMovingAverage from "../../../strategies/simpleMovingAverage";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

const backTester = new BackTester([{
    "timestamp": "2018-11-15T15:00:00.000Z",
    "high": 5456.74,
    "low": 5413.16,
    "open": 5456.14,
    "close": 5424.16,
    "volume": 1160455.58,
}]);
const pair: Pair = ["BTC", "USD"];
const localExchange = new LocalExchange();
backTester["exchange"] = localExchange;
const emitCandlesMock = jest.fn();

backTester.setStrategy({
    strategy: SimpleMovingAverage,
    pair: pair,
    interval: HitBTCCandleInterval.ONE_HOUR,
});

beforeEach(() => {
    localExchange.emitCandles = emitCandlesMock;
});

afterEach(() => {
    emitCandlesMock.mockRestore();
});


describe("start", () => {
    it("Should throw error with no candle loader", async () => {
        try {
            await backTester.start();
        } catch (e) {
            expect(e.toString()).toEqual("Error: No candles found as input.");
        }
    });

    it("Should bind events if not bound yet", async () => {
        backTester["eventsBound"] = false;
        const subscribeToExchangeEventsMock = jest.fn();
        backTester.subscribeToExchangeEvents = subscribeToExchangeEventsMock;

        const bindStrategyToExchangeSpy = jest.spyOn(backTester, "bindStrategyToExchange" as any);
        const bindExchangeToStrategySpy = jest.spyOn(backTester, "bindExchangeToStrategy" as any);

        await backTester.start();
        expect(subscribeToExchangeEventsMock).toBeCalledWith({
            strategy: SimpleMovingAverage,
            pair: pair,
            interval: HitBTCCandleInterval.ONE_HOUR,
        });

        expect(bindStrategyToExchangeSpy).toHaveBeenCalledWith(expect.objectContaining({
            pair,
            exchange: localExchange,
        }));
        expect(backTester["eventsBound"]).toEqual(true);
        expect(bindExchangeToStrategySpy).toBeCalledTimes(1);
    });
});
