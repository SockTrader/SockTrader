/* tslint:disable */
import {expect} from "chai";
import 'jest';
import {mock, spy} from "sinon";
import BaseExchange from "../core/exchanges/baseExchange";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../core/orderInterface";
import Orderbook from "../core/orderbook";
import CandleCollection from "../core/candleCollection";
import {EventEmitter} from "events";
import moment from "moment";
import {Pair} from "../types/pair";

const pair: Pair = ["BTC", "USD"];

// @ts-ignore
class MockExchange extends BaseExchange {
    public constructor() {
        super();
    }
}

describe("Exchange", () => {
    let exc = new MockExchange();
    const getReport = (): IOrder => ({
        id: "123",
        createdAt: moment(),
        price: 10,
        quantity: 0.5,
        reportType: ReportType.NEW,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        pair: pair,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.LIMIT,
        updatedAt: moment(),
    });

    const getOrder = (): IOrder => ({
        id: "4559a45057ded19e04d715c4b40f7ddd",
        createdAt: moment(),
        price: 0.001263,
        quantity: 0.02,
        reportType: ReportType.NEW,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        pair: pair,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.LIMIT,
        updatedAt: moment(),
    });


    beforeEach(() => {
        exc = new MockExchange();
    });

    it("Should generate a random order id", () => {
        const orderId = exc["generateOrderId"](pair);
        expect(orderId).to.be.a("string");
        expect(orderId).to.have.lengthOf(32);
    });

    it("Should create a buy order", () => {
        const createOrder = spy(exc, "createOrder" as any);
        exc.buy(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal([["BTC", "USD"], 1, 10, "buy"]);
    });

    it("Should create a sell order", () => {
        const createOrder = spy(exc, "createOrder" as any);
        exc.sell(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal([["BTC", "USD"], 1, 10, "sell"]);
    });

    it("Should put an order into progress when creating an order", () => {
        const setOrderInProgress = spy(exc, "setOrderInProgress" as any);
        const orderId = exc["createOrder"](pair, 1, 10, OrderSide.SELL);
        expect(setOrderInProgress.calledOnce).to.eq(true);
        expect(exc["orderInProgress"][orderId]).to.equal(true);
    });

    it("Should put an order in/out of progress", () => {
        const id = "ORDER_123";
        exc["setOrderInProgress"](id, true);
        expect(exc["orderInProgress"][id]).to.equal(true);
        exc["setOrderInProgress"](id, false);
        expect(exc["orderInProgress"][id]).to.equal(undefined);
    });

    it("Should return a cached candle collection for a trading pair", () => {
        const interval = {code: "M1", cron: "00 */1 * * * *"};
        const ob = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).to.be.an.instanceof(CandleCollection);
        expect(ob).to.not.be.equal(new CandleCollection(interval));

        const ob2 = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).to.be.equal(ob2);
    });

    it("Should track all order changes", () => {
        const addOrder = spy(exc, "addOrder" as any);
        const removeOrder = spy(exc, "removeOrder" as any);
        const report = getReport();
        exc.onReport({...report, reportType: ReportType.NEW});
        expect(addOrder.calledOnce).to.eq(true);

        exc.onReport({
            ...report,
            reportType: ReportType.REPLACED,
            originalId: "123",
            id: "321",
        });
        expect(removeOrder.calledOnce).to.eq(true);
        expect(addOrder.calledTwice).to.eq(true);

        exc.onReport({...report, reportType: ReportType.TRADE, status: OrderStatus.FILLED});
        expect(removeOrder.calledTwice).to.eq(true);

        exc.onReport({...report, reportType: ReportType.CANCELED});
        expect(removeOrder.calledThrice).to.eq(true);

        exc.onReport({...report, reportType: ReportType.EXPIRED});
        expect(removeOrder.callCount).to.eq(4);

        exc.onReport({...report, reportType: ReportType.SUSPENDED});
        expect(removeOrder.callCount).to.eq(5);
    });

    it("Should connect via a websocket connection string", () => {
        const spyOn = spy(exc["socketClient"], "on");
        const spyConnect = spy(exc["socketClient"], "connect");

        exc.connect("wss://my.fake.socket");

        expect(spyOn.args[0][0]).to.equal("connectFailed");
        expect(spyOn.args[1][0]).to.equal("connect");
        expect(spyConnect.args[0]).to.deep.equal(["wss://my.fake.socket"]);
    });

    it("Should remove all event listeners once the exchange is destroyed", () => {
        // This test should prevent memory leaks in an exchange.
        const spyRemoveListeners = spy(exc, "removeAllListeners");

        exc.destroy();

        expect(exc).to.be.an.instanceof(EventEmitter);
        expect(spyRemoveListeners.calledOnce).to.eq(true);
    });

    it("Should send messages over a socket connection", () => {
        expect(() => exc.send("test_method", {param1: "param1", param2: "param2"}))
            .to.throw("First connect to the exchange before sending instructions..");

        const connection = {send: () => null};
        const mockConnection = mock(connection);
        exc["connection"] = connection as any;
        const result = JSON.stringify({"method": "test", "params": {"param1": "1", "param2": "2"}, "id": "test"});
        mockConnection.expects("send").once().withArgs(result);

        exc.send("test", {param1: "1", param2: "2"});
        mockConnection.verify();
    });

    it("Should store all open orders", () => {
        // const exc = new HitBTC();
        const order = getOrder();

        expect(exc.getOpenOrders()).to.deep.eq([]);

        exc["addOrder"](order);
        expect(exc.getOpenOrders()).to.deep.eq([order]);
    });

    it("Should generate new order id's", () => {
        expect(exc.generateOrderId(pair).length).to.be.equal(32);
        expect(exc.generateOrderId(pair)).to.be.an("string");
    });

    it("Should verify if an order can be adjusted", () => {
        const order = getOrder();

        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).to.equal(true);
        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).to.equal(false);

        exc["orderInProgress"] = {};
        expect(exc["isAdjustingOrderAllowed"](order, 0.001263, 0.02)).to.equal(false);
    });

    it("Should get singleton exchange orderbook", () => {
        const symbol = pair.join("");

        // No configuration given
        expect(() => exc.getOrderbook(pair)).to.throw("No configuration found for pair: \"BTCUSD\"");

        exc.currencies[symbol] = {id: pair, quantityIncrement: 10, tickSize: 0.000001};

        // Returns a new empty orderbook
        const orderbook = exc.getOrderbook(pair);
        expect(orderbook).to.deep.equal({pair, precision: 6, ask: [], bid: []});
        expect(orderbook).to.be.an.instanceof(Orderbook);
        expect(exc["orderbooks"][symbol]).to.equal(orderbook);

        expect(orderbook).to.not.equal(new Orderbook(pair, 6));

        const orderbook2 = exc.getOrderbook(pair);
        expect(orderbook2).to.equal(orderbook);
    });
});