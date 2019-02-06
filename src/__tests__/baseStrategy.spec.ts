/* tslint:disable */
import "jest";
import BaseStrategy from "../sockTrader/core/strategy/baseStrategy";
import {IOrder, OrderSide} from "../sockTrader/core/types/order";

class MyStrategy extends BaseStrategy {
}

// @ts-ignore
const strategy = new MyStrategy();
let emitMock = null;

beforeEach(() => {
    emitMock = jest.fn();
    strategy.emit = emitMock;
});

afterEach(() => {
    emitMock.mockRestore();
});

describe("notifyOrder", () => {
    test("Should throw error when notifyOrder is not implemented", () => {
        expect(() => strategy.notifyOrder({})).toThrow("Implement method: notifyOrder");
    });
});

describe("updateCandles", () => {
    test("Should throw error when updateCandles is not implemented", () => {
        expect(() => strategy.updateCandles([])).toThrow("Implement method: updateCandles");
    });
});

describe("updateOrderbook", () => {
    test("Should throw when updateOrderbook is not implemented", () => {
        expect(() => strategy.updateOrderbook({})).toThrow("Implement method: updateOrderbook");
    });
});

describe("adjust", () => {
    test("Should emit adjustOrder event", () => {
        strategy.adjust({side: OrderSide.BUY} as IOrder, 10, 1);

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
        strategy.buy("BTCUSD", 10, 1);

        expect(emitMock).toBeCalledTimes(1);
        expect(emitMock).toBeCalledWith("app.signal", {
            price: 10,
            qty: 1,
            side: "buy",
            symbol: "BTCUSD",
        });
    });
});

describe("sell", () => {
    test("Should emit sell signal", () => {
        strategy.sell("BTCUSD", 10, 1);

        expect(emitMock).toBeCalledTimes(1)
        expect(emitMock).toBeCalledWith("app.signal", {
            price: 10,
            qty: 1,
            side: "sell",
            symbol: "BTCUSD",
        });
    });
});

