/* tslint:disable */
import {expect} from "chai";
import 'jest';
import moment from "moment";
import {spy, stub} from "sinon";
import {IOrder, OrderSide} from "../sockTrader/core/types/order";
import HitBTC, {CandleInterval} from "../sockTrader/core/exchanges/hitBTC";
import CandleCollection, {ICandle} from "../sockTrader/core/candles/candleCollection";
import {connection} from "websocket";
import {EventEmitter} from "events";
import {Pair} from "../sockTrader/core/types/pair";
import {IOrderbookData} from "../sockTrader/core/exchanges/baseExchange";

const pair: Pair = ["BTC", "USD"];

describe("HitBTC", () => {

    let exchange = new HitBTC("PUB_123", "SEC_123");
    let send = null;

    beforeEach(() => {
        exchange = new HitBTC("PUB_123", "SEC_123");
        send = stub(exchange, "send");
    });

    afterEach(() => {
        send.restore();
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
        exchange.subscribeOrderbook(pair);
        expect(send.args[0][0]).to.equal("subscribeOrderbook");
        expect(send.args[0][1]).to.deep.equal({symbol: pair});
    });

    it("Should subscribe to candle events", () => {
        exchange.subscribeCandles(pair, CandleInterval.FIVE_MINUTES);
        expect(send.args[0][0]).to.equal("subscribeCandles");
        expect(send.args[0][1]).to.deep.equal({period: "M5", symbol: pair});
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

        exchange.onUpdateCandles(pair, candles, CandleInterval.FIVE_MINUTES, "set");
        expect(set.calledOnce).to.equal(true);
        expect(set.args[0][0][0]).to.deep.include({close: 1, high: 2, low: 0, open: 0, volume: 10});
        expect(set.args[0][0][0]).to.include.all.keys("timestamp");

        set.restore();
        getCollection.restore();
    });

    it("Should emit candle events on an update", () => {
        const emit = spy(exchange, "emit");
        const candles: ICandle[] = [{close: 1, high: 2, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle];
        exchange.onUpdateCandles(pair, candles, CandleInterval.FIVE_MINUTES, "set");

        expect(emit.calledOnce).to.equal(true);
        expect(emit.args[0][0]).to.equal("app.updateCandles");
        expect(emit.args[0][1]).to.deep.equal(candles);

        emit.restore();
    });

    it("Should update an in memory orderbook", () => {
        const emit = stub(exchange, "emit");
        const getOrderbook = spy(exchange, "getOrderbook");
        const ob: IOrderbookData = {
            sequence: 1,
            pair,
            ask: [
                {price: 0.0015, size: 100},
            ],
            bid: [
                {price: 0.001391, size: 40},
            ],
        };

        const {pair: symbol, ask, bid} = ob;
        exchange.currencies[pair.join("")] = {id: pair, quantityIncrement: 10, tickSize: 0.000001};

        exchange.onUpdateOrderbook({...ob, sequence: -1}, "setOrders");
        expect(getOrderbook.called).to.be.equal(false);

        exchange.onUpdateOrderbook(ob, "setOrders");
        expect(getOrderbook.called).to.be.equal(true);

        expect(emit.args[0][0]).to.equal("app.updateOrderbook");
        expect(emit.args[0][1]).to.deep.equal({ask, bid, pair: symbol, precision: 6});
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
        exchange.cancelOrder({id: "123"} as IOrder);

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

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(send.calledOnce).to.equal(true);
        expect(send.args[0][0]).to.equal("cancelReplaceOrder");
        expect(send.args[0][1]).to.include({clientOrderId: "123", price: 0.002, quantity: 0.5, strictValidate: true});
        expect(send.args[0][1]).to.include.all.keys("requestClientId");

        adjustAllowed.restore();
    });

    it("Should create a new order", () => {
        const orderId = exchange["createOrder"](pair, 10, 1, OrderSide.BUY);

        expect(send.calledOnce).to.equal(true);
        expect(send.args[0][0]).to.equal("newOrder");
        expect(send.args[0][1].clientOrderId).to.equal(orderId);
        expect(send.args[0][1]).to.contain({
            price: 10,
            quantity: 1,
            side: "buy",
            symbol: pair,
            type: "limit",
        });
    });

    it("Should initialize when exchange is connected", () => {
        const loadCurrencies = stub(exchange, "loadCurrencies");
        const onReceive = stub(exchange.mapper, "onReceive");
        const login = stub(exchange, "login");
        const connection = new EventEmitter();

        exchange["onConnect"](connection as connection);

        expect(loadCurrencies.calledOnce).to.be.equal(true);
        expect(login.calledOnce).to.be.equal(true);
        expect(login.args[0]).to.deep.equal(["PUB_123", "SEC_123"]);

        connection.emit("message", JSON.stringify({test: "123"}));

        expect(onReceive.calledOnce).to.be.equal(true);
        expect(onReceive.args[0][0]).to.equal(JSON.stringify({test: "123"}));

        loadCurrencies.restore();
        onReceive.restore();
        login.restore();
    });

    it("Should connect", () => {
        // @ts-ignore
        const connect = stub(exchange.__proto__.__proto__, "connect");

        exchange.connect();
        expect(connect.args[0]).to.deep.equal(['wss://api.hitbtc.com/api/2/ws']);
    });
});
