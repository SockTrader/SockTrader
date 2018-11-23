/* tslint:disable */
import {expect} from "chai";
import {describe, it} from "mocha";
import {stub, spy} from "sinon";
import {OrderSide} from "../src/core/orderInterface";
import {withBacktest} from "../src/core/strategy";
import BaseStrategy from "../src/core/strategy/baseStrategy";

class MyStrategy extends BaseStrategy {
}

let exchange = {generateOrderId: () => undefined};
let Backtest = withBacktest(MyStrategy as any);

describe("BackTest", () => {

    let backtest = undefined;
    let notifyOrder = undefined;
    let generateOrderId = undefined;

    beforeEach(() => {
        backtest = new Backtest("ETHBTC", exchange as any);
        notifyOrder = stub(backtest, "notifyOrder");
        generateOrderId = stub(backtest.exchange, "generateOrderId");
    })

    afterEach(() => {
        notifyOrder.restore();
        generateOrderId.restore();
    })

    it("Should store orders internally", () => {
        generateOrderId.returns("123");
        const result = backtest.emit("app.signal", {
            symbol: "ETHBTC", price: 10, qty: 1, side: OrderSide.BUY,
        });

        expect(result).to.equal(false);
        expect(notifyOrder.args[0][0]).to.include({
            symbol: "ETHBTC", price: 10, quantity: 1, side: OrderSide.BUY,
        });
        expect(backtest.openOrders[0]).to.include({
            symbol: "ETHBTC", price: 10, quantity: 1, side: OrderSide.BUY,
        });

        backtest.exchange.generateOrderId.reset();
    });

    it("Should adjust orders internally", () => {
        generateOrderId.onCall(0).returns("123");
        generateOrderId.onCall(1).returns("456");

        expect(backtest.emit("app.signal", {
            symbol: "ETHBTC", price: 10, qty: 1, side: OrderSide.BUY,
        })).to.equal(false);
        expect(backtest.emit("app.adjustOrder", {
            order: { id: "123" }, price: 1, qty: 10
        })).to.equal(false);

        expect(notifyOrder.args[1][0]).to.include({
            symbol: "ETHBTC", price: 1, quantity: 10, side: OrderSide.BUY,
            originalRequestClientOrderId: "123", clientOrderId: "456"
        });
        expect(backtest.openOrders[0]).to.include({
            symbol: "ETHBTC", price: 1, quantity: 10, side: OrderSide.BUY,
        });
    });
});