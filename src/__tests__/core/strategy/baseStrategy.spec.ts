import SimpleMovingAverage from "../../../strategies/simpleMovingAverage";
import {FX_CANDLE_LIST} from "../../../__fixtures__/candles";
import CandleCollection from "../../../sockTrader/core/candles/candleCollection";
import {OrderSide} from "../../../sockTrader/core/types/order";
import {FX_NEW_BUY_ORDER} from "../../../__fixtures__/order";

let strategy: any = new SimpleMovingAverage(["BTC", "USD"], jest.fn() as any);
beforeEach(() => {
    strategy = new SimpleMovingAverage(["BTC", "USD"], jest.fn() as any);

});

describe("_onUpdateCandles", () => {
    it("Should wrap incoming candles in a CandleCollection", () => {
        const spy = jest.spyOn(strategy, "updateCandles");
        strategy._onUpdateCandles(FX_CANDLE_LIST);

        expect(spy).toBeCalledTimes(1);
        expect(spy).toBeCalledWith(new CandleCollection(...FX_CANDLE_LIST));
    });
});

describe("_onSnapshotCandles", () => {
    it("Should wrap incoming candles in a CandleCollection", () => {
        const spy = jest.spyOn(strategy, "warmUpCandles" as any);
        strategy._onSnapshotCandles(FX_CANDLE_LIST);

        expect(spy).toBeCalledTimes(1);
        expect(spy).toBeCalledWith(new CandleCollection(...FX_CANDLE_LIST));
    });
});

describe("adjust", () => {
    it("Should emit incoming order adjustment as event", () => {
        strategy.emit = jest.fn();
        strategy["adjust"](FX_NEW_BUY_ORDER, 100, 2);

        expect(strategy.emit).toBeCalledTimes(1);
        expect(strategy.emit).toBeCalledWith("core.adjustOrder", {
            order: FX_NEW_BUY_ORDER,
            price: 100,
            qty: 2,
        });
    });
});

describe("signal", () => {
    it("Should emit incoming signal as event", () => {
        strategy.emit = jest.fn();
        strategy["signal"](["BTC", "USD"], 10, 1, OrderSide.SELL);

        expect(strategy.emit).toBeCalledTimes(1);
        expect(strategy.emit).toBeCalledWith("core.signal", {
            price: 10,
            qty: 1,
            side: "sell",
            symbol: ["BTC", "USD"],
        });
    });
});

describe("buy", () => {
    it("Should proxy function call to \"this.signal\"", () => {
        strategy.signal = jest.fn();
        strategy["buy"](["BTC", "USD"], 10, 1);

        expect(strategy.signal).toBeCalledTimes(1);
        expect(strategy.signal).toBeCalledWith(["BTC", "USD"], 10, 1, OrderSide.BUY);
    });
});

describe("sell", () => {
    it("Should proxy function call to \"this.signal\"", () => {
        strategy.signal = jest.fn();
        strategy["sell"](["BTC", "USD"], 10, 1);

        expect(strategy.signal).toBeCalledTimes(1);
        expect(strategy.signal).toBeCalledWith(["BTC", "USD"], 10, 1, OrderSide.SELL);
    });
});
