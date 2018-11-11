/* tslint:disable */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {spy, mock} from 'sinon';
import Exchange, {ITradeablePair} from "../src/core/exchanges/exchange";
import {OrderSide} from "../src/core/orderInterface";
import Orderbook from "../src/core/orderbook";
import CandleCollection from "../src/core/candleCollection";
import {EventEmitter} from "events";
import {connection} from "websocket";

const pair = 'BTCETH';

// @ts-ignore
class MockExchange extends Exchange {
    public constructor() {
        super();
    }
}

describe('Exchange', () => {
    let exc = new MockExchange();

    beforeEach(() => {
        exc = new MockExchange();
    });

    it('Should generate a random order id', () => {
        const orderId = exc['generateOrderId'](pair);
        expect(orderId).to.be.a('string');
        expect(orderId).to.have.lengthOf(32);
    });

    it('Should create a buy order', () => {
        const createOrder = spy(exc, "createOrder" as any);
        exc.buy(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal(["BTCETH", 1, 10, "buy"]);
    });

    it('Should create a sell order', () => {
        const createOrder = spy(exc, "createOrder" as any);
        exc.sell(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal(["BTCETH", 1, 10, "sell"]);
    });

    it('Should put an order into progress when creating an order', () => {
        const setOrderInProgress = spy(exc, "setOrderInProgress" as any);
        const orderId = exc["createOrder"](pair, 1, 10, OrderSide.SELL);
        expect(setOrderInProgress.calledOnce).to.eq(true);
        expect(exc["orderInProgress"][orderId]).to.equal(true);
    });

    it('Should put an order in/out of progress', () => {
        const id = 'ORDER_123';
        exc["setOrderInProgress"](id, true);
        expect(exc["orderInProgress"][id]).to.equal(true);
        exc["setOrderInProgress"](id, false);
        expect(exc["orderInProgress"][id]).to.equal(undefined);
    });

    it('Should return a cached orderbook for a trading pair', () => {
        exc["currencies"] = [{tickSize: 0.001, id: pair} as ITradeablePair];
        const ob = exc.getOrderbook(pair);
        expect(ob).to.be.an.instanceof(Orderbook);
        expect(ob).to.not.be.equal(new Orderbook(pair, 3));

        const ob2 = exc.getOrderbook(pair);
        expect(ob).to.be.equal(ob2);
    });

    it('Should return a cached candle collection for a trading pair', () => {
        const interval = {code: "M1", cron: "00 */1 * * * *"};
        const ob = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).to.be.an.instanceof(CandleCollection);
        expect(ob).to.not.be.equal(new CandleCollection(interval));

        const ob2 = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).to.be.equal(ob2);
    });

    it('Should track all order changes', () => {
        const addOrder = spy(exc, "addOrder" as any);
        const removeOrder = spy(exc, "removeOrder" as any);
        exc.onReport({params: {reportType: "new", clientOrderId: '123'}});
        expect(addOrder.calledOnce).to.eq(true);

        exc.onReport({params: {reportType: "replaced", originalRequestClientOrderId: '123', clientOrderId: '321'}});
        expect(removeOrder.calledOnce).to.eq(true);
        expect(addOrder.calledTwice).to.eq(true);

        exc.onReport({params: {reportType: "trade", status: "filled", clientOrderId: '123'}});
        expect(removeOrder.calledTwice).to.eq(true);

        exc.onReport({params: {reportType: "canceled", clientOrderId: '321'}});
        expect(removeOrder.calledThrice).to.eq(true);

        exc.onReport({params: {reportType: "expired", clientOrderId: '321'}});
        expect(removeOrder.callCount).to.eq(4);

        exc.onReport({params: {reportType: "suspended", clientOrderId: '321'}});
        expect(removeOrder.callCount).to.eq(5);
    });

    it("Should connect via a websocket connection string", () => {
        const spyOn = spy(exc["socketClient"], "on");
        const spyConnect = spy(exc["socketClient"], "connect");

        exc.connect('wss://my.fake.socket');

        expect(spyOn.args[0][0]).to.equal("connectFailed");
        expect(spyOn.args[1][0]).to.equal("connect");
        expect(spyConnect.args[0]).to.deep.equal(['wss://my.fake.socket']);
    });

    it('Should remove all event listeners once the exchange is destroyed', () => {
        // This test should prevent memory leaks in an exchange.
        const spyRemoveListeners = spy(exc, "removeAllListeners");

        exc.destroy();

        expect(exc).to.be.an.instanceof(EventEmitter);
        expect(spyRemoveListeners.calledOnce).to.eq(true);
    });

    it('Should send messages over a socket connection', () => {
        expect(() => exc.send('test_method', {param1: 'param1', param2: 'param2'}))
            .to.throw("First connect to the exchange before sending instructions..");

        const connection = {send: () => null};
        const mockConnection = mock(connection);
        exc["connection"] = connection as any;
        const result = JSON.stringify({"method": "test", "params": {"param1": "1", "param2": "2"}, "id": "test"});
        mockConnection.expects("send").once().withArgs(result);

        exc.send('test', {param1: '1', param2: '2'});
        mockConnection.verify();
    });
});