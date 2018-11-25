/* tslint:disable */
import {expect} from "chai";
import {describe, it} from "mocha";
import moment = require("moment");
import {spy, stub} from "sinon";
import Orderbook from "../orderbook";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import HitBTC, {CandleInterval} from "./hitBTC";
import CandleCollection, {ICandle} from "../candleCollection";

const pair = "BTCETH";

describe("HitBTC", () => {
    const getOrder = (): IOrder => ({
        clientOrderId: "4559a45057ded19e04d715c4b40f7ddd",
        createdAt: moment(),
        cumQuantity: 0,
        id: "38727737188",
        price: 0.001263,
        quantity: 0.02,
        reportType: ReportType.NEW,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        symbol: pair,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.MARKET,
        updatedAt: moment(),
    });

    let exchange = new HitBTC();
    let send = null;

    beforeEach(() => {
        exchange = new HitBTC();
        send = stub(exchange, "send");
    });

    afterEach(() => {
        send.restore();
    });

    // @TODO move test to baseExchange.spec.ts
    it("get exchange orderbook", () => {
        // const exc = new HitBTC();
        const ob1 = new Orderbook(pair, 6);

        // No configuration given
        expect(() => exchange.getOrderbook(pair)).to.throw();

        exchange["currencies"] = [{id: pair, quantityIncrement: 10, tickSize: 0.000001}];

        // Returns a new empty orderbook
        expect(exchange.getOrderbook(pair)).to.deep.equal({pair, precision: 6, ask: [], bid: []});

        ob1.setOrders([
            {price: 0.074819, size: 100},
            {price: 0.074817, size: 100},
            {price: 0.074834, size: 2500},
        ], [
            {price: 0.074940, size: 451},
            {price: 0.074944, size: 2000},
            {price: 0.074925, size: 100},
        ]);
        exchange["orderbooks"] = {[pair]: ob1};

        // Returns filled orderbook
        expect(exchange.getOrderbook(pair)).to.deep.equal(ob1);
        expect(exchange.getOrderbook(pair).ask[0]).to.deep.equal({price: 0.074817, size: 100});
        expect(exchange.getOrderbook(pair).bid[0]).to.deep.equal({price: 0.074944, size: 2000});
    });

    it("Should trigger the onCreate lifecycle event", () => {
        const onCreate = spy(HitBTC.prototype, "onCreate");
        HitBTC.getInstance();
        HitBTC.getInstance();

        expect(onCreate.calledOnce).to.equal(true);
        expect(onCreate.args[0]).to.deep.equal([]);
        onCreate.restore();
    });

    it("Should subscribe to report events", () => {
        exchange.subscribeReports();
        expect(send.args[0][0]).to.equal("subscribeReports");
    });

    it("Should subscribe to orderbook events", () => {
        exchange.subscribeOrderbook("BTCUSD");
        expect(send.args[0][0]).to.equal("subscribeOrderbook");
        expect(send.args[0][1]).to.deep.equal({symbol: "BTCUSD"});
    });

    it("Should subscribe to candle events", () => {
        exchange.subscribeCandles("BTCUSD", CandleInterval.FIVE_MINUTES);
        expect(send.args[0][0]).to.equal("subscribeCandles");
        expect(send.args[0][1]).to.deep.equal({period: "M5", symbol: "BTCUSD"});
    });

    it("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");
        expect(send.args[0][0]).to.equal("login");
        expect(send.args[0][1]).to.include({"algo": "HS256", "pKey": "PUB_123"});
        expect(send.args[0][1]).to.include.all.keys("signature", "nonce");
    });

    it("Should update a candle collection for a trading pair", () => {
        const getCollection = stub(exchange, "getCandleCollection");
        const collection = new CandleCollection(CandleInterval.FIVE_MINUTES);
        const set = spy(collection, "set");
        getCollection.returns(collection);

        const candles: ICandle[] = [{close: 1, high: 2, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle];

        exchange.onUpdateCandles("BTCUSD", candles, CandleInterval.FIVE_MINUTES, "set");
        expect(set.calledOnce).to.equal(true);
        expect(set.args[0][0][0]).to.deep.include({close: 1, high: 2, low: 0, open: 0, volume: 10});
        expect(set.args[0][0][0]).to.include.all.keys("timestamp");

        set.restore();
        getCollection.restore();
    });

    it("Should emit candle events on an update", () => {
        const emit = spy(exchange, "emit");
        const candles: ICandle[] = [{close: 1, high: 2, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle];
        exchange.onUpdateCandles("BTCUSD", candles, CandleInterval.FIVE_MINUTES, "set");

        expect(emit.calledOnce).to.equal(true);
        expect(emit.args[0][0]).to.equal("app.updateCandles");
        expect(emit.args[0][1]).to.deep.equal(candles);

        emit.restore();
    });

    it("Should update an in memory orderbook", () => {
        const emit = stub(exchange, "emit");
        const getOrderbook = spy(exchange, "getOrderbook");
        const ob = {
            sequence: 1,
            symbol: "BTCUSD",
            ask: [
                {price: 0.0015, size: 100},
            ],
            bid: [
                {price: 0.001391, size: 40},
            ],
        };

        const {symbol: pair, ask, bid} = ob;
        exchange["currencies"] = [{id: pair, quantityIncrement: 10, tickSize: 0.000001}];

        exchange.onUpdateOrderbook({...ob, sequence: -1}, "setOrders");
        expect(getOrderbook.called).to.be.equal(false);

        exchange.onUpdateOrderbook(ob, "setOrders");
        expect(getOrderbook.called).to.be.equal(true);

        expect(emit.args[0][0]).to.equal("app.updateOrderbook");
        expect(emit.args[0][1]).to.deep.equal({ask, bid, pair, precision: 6});
        emit.restore();
        getOrderbook.restore();
    });

    it("Should load currency configuration from the exchange", () => {
        exchange.loadCurrencies();
        expect(send.calledOnce).to.equal(true);
        expect(send.args[0]).to.deep.equal(["getSymbols"]);
    });

    it("Should cancel an order", () => {
        // @ts-ignore
        const setOrderInProgress = stub(exchange, "setOrderInProgress");
        exchange.cancelOrder({clientOrderId: "123"} as IOrder);

        expect(setOrderInProgress.calledOnce).to.equal(true);
        expect(setOrderInProgress.args[0]).to.deep.equal(["123"]);
        expect(send.calledOnce).to.equal(true);
        expect(send.args[0]).to.deep.equal(["cancelOrder", {clientOrderId: "123"}]);

        setOrderInProgress.restore();
    });

    it("Should adjust existing orders", () => {
        // @ts-ignore
        const adjustAllowed = stub(exchange, "isAdjustingOrderAllowed");
        adjustAllowed.returns(true);

        exchange.adjustOrder({symbol: "BTCUSD", clientOrderId: "123"} as IOrder, 0.002, 0.5);
        expect(send.calledOnce).to.equal(true);
        expect(send.args[0][0]).to.equal("cancelReplaceOrder");
        expect(send.args[0][1]).to.include({clientOrderId: "123", price: 0.002, quantity: 0.5, strictValidate: true});
        expect(send.args[0][1]).to.include.all.keys("requestClientId");

        adjustAllowed.restore();
    });

    // @TODO move test to baseExchange.spec.ts
    it("is adjusting allowed", () => {
        const exc = new HitBTC();
        const order = getOrder();

        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).to.equal(true);
        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).to.equal(false);

        exc["orderInProgress"] = {};
        expect(exc["isAdjustingOrderAllowed"](order, 0.001263, 0.02)).to.equal(false);
    });

    // @TODO move test to baseExchange.spec.ts
    it("generate new order id", () => {
        const exc = new HitBTC();
        expect(exc.generateOrderId(pair).length).to.be.equal(32);
        expect(exc.generateOrderId(pair)).to.be.an("string");
    });

    // @TODO move test to baseExchange.spec.ts
    it("get open orders", () => {
        const exc = new HitBTC();
        const order = getOrder();

        expect(exc.getOpenOrders()).to.deep.eq([]);

        exc["addOrder"](order);
        expect(exc.getOpenOrders()).to.deep.eq([order]);
    });

    it("Should create a new order", () => {
        const orderId = exchange["createOrder"]("BTCUSD", 10, 1, OrderSide.BUY);

        expect(send.calledOnce).to.equal(true);
        expect(send.args[0][0]).to.equal("newOrder");
        expect(send.args[0][1].clientOrderId).to.equal(orderId);
        expect(send.args[0][1]).to.contain({
            price: 10,
            quantity: 1,
            side: "buy",
            symbol: "BTCUSD",
            type: "limit",
        });
    });
});
