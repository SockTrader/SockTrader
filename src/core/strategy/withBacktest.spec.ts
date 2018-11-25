/* tslint:disable */
import {expect} from "chai";
import {describe, it} from "mocha";
import {stub, spy} from "sinon";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../orderInterface";
import {withBacktest} from "./index";
import BaseStrategy from "./baseStrategy";
import moment = require("moment");
import {ICandle} from "../candleCollection";

class MyStrategy extends BaseStrategy {
}

let exchange = {generateOrderId: () => undefined};
let Backtest = withBacktest(MyStrategy as any);

describe("Backtest", () => {

    let backtest = undefined;
    let notifyOrder = undefined;
    let generateOrderId = undefined;
    const buySignal = {symbol: "ETHBTC", price: 10, qty: 1, side: OrderSide.BUY};

    beforeEach(() => {
        backtest = new Backtest("ETHBTC", exchange as any);
        notifyOrder = stub(backtest, "notifyOrder");
        generateOrderId = stub(backtest.exchange, "generateOrderId");
    });

    afterEach(() => {
        notifyOrder.restore();
        generateOrderId.restore();
    });

    it("Should ignore non-signal events", () => {
        const callback = spy();
        backtest.once("unit.test", callback);
        backtest.emit("unit.test", "123");

        expect(callback.calledOnce).to.equal(true);
        expect(callback.args[0]).to.deep.equal(["123"]);
    });

    it("Should store orders internally", () => {
        generateOrderId.returns("123");
        const result = backtest.emit("app.signal", buySignal);

        expect(result).to.equal(false);
        expect(notifyOrder.args[0][0]).to.include({symbol: "ETHBTC", price: 10, quantity: 1, side: OrderSide.BUY});
        expect(backtest.openOrders[0]).to.include({symbol: "ETHBTC", price: 10, quantity: 1, side: OrderSide.BUY});

        backtest.exchange.generateOrderId.reset();
    });

    it("Should adjust orders internally", () => {
        generateOrderId.onCall(0).returns("123");
        generateOrderId.onCall(1).returns("456");

        expect(backtest.emit("app.signal", buySignal)).to.equal(false);
        expect(backtest.emit("app.adjustOrder", {order: {id: "123"}, price: 1, qty: 10})).to.equal(false);

        expect(notifyOrder.args[1][0]).to.include({
            symbol: "ETHBTC", price: 1, quantity: 10, side: OrderSide.BUY,
            originalRequestClientOrderId: "123", clientOrderId: "456",
        });
        expect(backtest.openOrders[0]).to.include({
            symbol: "ETHBTC", price: 1, quantity: 10, side: OrderSide.BUY,
        });
    });

    it("Should clean open orders once a price target is hit", () => {
        backtest.openOrders.push({createdAt: moment(), side: OrderSide.BUY, price: 10} as IOrder);
        backtest.openOrders.push({createdAt: moment(), side: OrderSide.SELL, price: 15} as IOrder);

        expect(backtest.openOrders.length).to.equal(2);

        // Process orders with older candle
        const timestamp = moment().subtract(5, "minutes");
        backtest.processOpenOrders({close: 10, high: 10, low: 9, open: 10, timestamp, volume: 0});

        expect(backtest.openOrders.length).to.equal(2);

        // Process orders with newer candle
        backtest.processOpenOrders({close: 10, high: 10, low: 9, open: 10, timestamp: moment(), volume: 0});

        expect(backtest.openOrders.length).to.equal(1);
        expect(backtest.openOrders[0]).to.include({side: OrderSide.SELL, price: 15});
    });

    it("Should track all filled orders", () => {
        backtest.openOrders.push({createdAt: moment(), side: OrderSide.BUY, price: 10} as IOrder);
        backtest.processOpenOrders({close: 10, high: 10, low: 9, open: 10} as ICandle);

        expect(backtest.filledOrders.length).to.equal(1);
        expect(backtest.filledOrders[0]).to.include({
            side: OrderSide.BUY,
            price: 10,
            reportType: ReportType.TRADE,
            status: OrderStatus.FILLED,
        });
    });

});
