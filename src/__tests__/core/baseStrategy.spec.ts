import BaseStrategy from "../../sockTrader/core/strategy/baseStrategy";
import {IOrder, OrderSide} from "../../sockTrader/core/types/order";
import {ICandle} from "../../sockTrader/core/candles/candleManager";
import {IOrderbook} from "../../sockTrader/core/orderbook";

class MyStrategy extends BaseStrategy {
    notifyOrder(order: IOrder): void {
    }

    updateCandles(candles: ICandle[]): void {
    }

    updateOrderbook(orderBook: IOrderbook): void {
    }
}

const strategy = new MyStrategy(["BTC", "USD"], jest.fn() as any);
let emitMock: any = null;

beforeEach(() => {
    emitMock = jest.fn();
    strategy.emit = emitMock;
});

afterEach(() => {
    emitMock.mockRestore();
});

describe("adjust", () => {
    test("Should emit adjustOrder event", () => {
        strategy["adjust"]({side: OrderSide.BUY} as IOrder, 10, 1);

        expect(emitMock).toBeCalledTimes(1);
        expect(emitMock).toBeCalledWith("app.adjustOrder", {
            order: {
                side: "buy",
            },
            price: 10,
            qty: 1,
        });
    });
});

describe("buy", () => {
    it("Should emit buy signal", () => {
        strategy["buy"](["BTC", "USD"], 10, 1);

        expect(emitMock).toBeCalledTimes(1);
        expect(emitMock).toBeCalledWith("app.signal", {
            price: 10,
            qty: 1,
            side: "buy",
            symbol: ["BTC", "USD"],
        });
    });
});

describe("sell", () => {
    test("Should emit sell signal", () => {
        strategy["sell"](["BTC", "USD"], 10, 1);

        expect(emitMock).toBeCalledTimes(1);
        expect(emitMock).toBeCalledWith("app.signal", {
            price: 10,
            qty: 1,
            side: "sell",
            symbol: ["BTC", "USD"],
        });
    });
});

