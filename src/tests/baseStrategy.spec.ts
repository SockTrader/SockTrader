/* tslint:disable */
import {expect} from "chai";
import 'jest';
import BaseStrategy from "../core/strategy/baseStrategy";
import {stub} from "sinon";
import {IOrder, OrderSide} from "../core/types/order";

class MyStrategy extends BaseStrategy {
}

// @ts-ignore
const strategy = new MyStrategy();
let emit = null;

describe("BaseStrategy", () => {

    beforeEach(() => {
        emit = stub(strategy, "emit");
    });

    afterEach(() => {
        emit.restore();
    });

    it("Should throw when notifyOrder is not implemented", () => {
        expect(strategy.notifyOrder).to.throw("Implement method: notifyOrder");
    });

    it("Should throw when updateCandles is not implemented", () => {
        expect(strategy.updateCandles).to.throw("Implement method: updateCandles");
    });

    it("Should throw when updateOrderbook is not implemented", () => {
        expect(strategy.updateOrderbook).to.throw("Implement method: updateOrderbook");
    });

    it("Should emit adjustOrder event", () => {
        strategy.adjust({side: OrderSide.BUY} as IOrder, 10, 1);

        // console.log(emit);
        expect(emit.calledOnce).to.equal(true);
        expect(emit.args[0]).to.deep.equal(["app.adjustOrder", {
            order: {
                side: "buy",
            },
            price: 10,
            qty: 1,
        }]);
    });

    it("Should emit buy signal", () => {
        strategy.buy("BTCUSD", 10, 1);

        // console.log(emit);
        expect(emit.calledOnce).to.equal(true);
        expect(emit.args[0]).to.deep.equal(["app.signal", {
            price: 10,
            qty: 1,
            side: "buy",
            symbol: "BTCUSD"
        }]);
    });

    it("Should emit sell signal", () => {
        strategy.sell("BTCUSD", 10, 1);

        // console.log(emit);
        expect(emit.calledOnce).to.equal(true);
        expect(emit.args[0]).to.deep.equal(["app.signal", {
            price: 10,
            qty: 1,
            side: "sell",
            symbol: "BTCUSD"
        }]);
    });
});
