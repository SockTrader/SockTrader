import SimpleMovingAverage from "../../strategies/simpleMovingAverage";
import SockTrader from "../../sockTrader/core/bot/sockTrader";
import {default as HitBTC, HitBTCCandleInterval} from "../../sockTrader/core/exchanges/hitBTC";
import {Pair} from "../../sockTrader/core/types/pair";
import Events from "../../sockTrader/core/events";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

class ConcreteSockTrader extends SockTrader {
}

const btcEthPair: Pair = ["BTC", "ETH"];

let hitBTC: HitBTC;
let sockTrader: ConcreteSockTrader;

beforeEach(() => {
    jest.clearAllMocks();

    hitBTC = new HitBTC();

    sockTrader = new ConcreteSockTrader();
    sockTrader["exchange"] = hitBTC;
});

describe("subscribeToExchangeEvents", () => {
    beforeEach(() => {
        hitBTC.subscribeReports = jest.fn();
        hitBTC.subscribeOrderbook = jest.fn();
        hitBTC.subscribeCandles = jest.fn();
    });

    it("Should subscribe once to orderbook, reports and candles", () => {
        sockTrader.subscribeToExchangeEvents({
            strategy: SimpleMovingAverage,
            pair: btcEthPair,
            interval: HitBTCCandleInterval.FIVE_MINUTES,
        });
        hitBTC.emit("ready");

        expect(hitBTC.subscribeReports).toBeCalledTimes(1);
        expect(hitBTC.subscribeOrderbook).toBeCalledTimes(1);
        expect(hitBTC.subscribeOrderbook).toBeCalledWith(btcEthPair);
        expect(hitBTC.subscribeCandles).toBeCalledTimes(1);
        expect(hitBTC.subscribeCandles).toBeCalledWith(btcEthPair, HitBTCCandleInterval.FIVE_MINUTES);
    });
});

describe("bindExchangeToStrategy", () => {
    it("Should bind exchange events to strategy", () => {
        const on = jest.spyOn(Events, "on");

        sockTrader["bindExchangeToStrategy"](new SimpleMovingAverage(btcEthPair, hitBTC));
        expect(on).toBeCalledWith("core.report", expect.any(Function));
        expect(on).toBeCalledWith("core.updateOrderbook", expect.any(Function));
        expect(on).toBeCalledWith("core.updateCandles", expect.any(Function));
    });
});

describe("bindStrategyToExchange", () => {
    it("Should bind strategy events to exchange", () => {
        const simpleMovingAverage: SimpleMovingAverage = new SimpleMovingAverage(btcEthPair, hitBTC);
        const spyOn = jest.spyOn(simpleMovingAverage, "on");

        sockTrader["bindStrategyToExchange"](simpleMovingAverage);
        expect(spyOn).toBeCalledWith("core.signal", expect.any(Function));
        expect(spyOn).toBeCalledWith("core.adjustOrder", expect.any(Function));
    });
});
