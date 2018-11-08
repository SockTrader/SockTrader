/* tslint:disable */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {spy} from 'sinon';
import Exchange, {ITradeablePair} from "../src/core/exchanges/exchange";
import {OrderSide} from "../src/core/orderInterface";
import Orderbook from "../src/core/orderbook";
import CandleCollection from "../src/core/candleCollection";

const pair = 'BTCETH';

// @ts-ignore
class MockExchange extends Exchange {
    public constructor() {
        super();
    }
}

describe('Exchange', () => {

    it('Should generate a random order id', () => {
        const exc = new MockExchange();
        const orderId = exc['generateOrderId'](pair);
        expect(orderId).to.be.a('string');
        expect(orderId).to.have.lengthOf(32);
    });

    it('Should create a buy order', () => {
        const exc = new MockExchange();
        const createOrder = spy(exc, <any>"createOrder");
        exc.buy(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal(["BTCETH", 1, 10, "buy"]);
    });

    it('Should create a sell order', () => {
        const exc = new MockExchange();
        const createOrder = spy(exc, <any>"createOrder");
        exc.sell(pair, 1, 10);
        expect(createOrder.calledOnce).to.eq(true);
        expect(createOrder.args[0]).to.deep.equal(["BTCETH", 1, 10, "sell"]);
    });

    it('Should put an order into progress when creating an order', () => {
        const exc = new MockExchange();
        const setOrderInProgress = spy(exc, <any>"setOrderInProgress");
        const orderId = exc["createOrder"](pair, 1, 10, OrderSide.SELL);
        expect(setOrderInProgress.calledOnce).to.eq(true);
        expect(exc["orderInProgress"][orderId]).to.equal(true);
    });

    it('Should put an order in/out of progress', () => {
        const exc = new MockExchange();
        const id = 'ORDER_123';
        exc["setOrderInProgress"](id, true);
        expect(exc["orderInProgress"][id]).to.equal(true);
        exc["setOrderInProgress"](id, false);
        expect(exc["orderInProgress"][id]).to.equal(undefined);
    });

    it('Should return an orderbook for a trading pair', () => {
        const exc = new MockExchange();
        exc["currencies"] = [{tickSize: 0.001, id: pair} as ITradeablePair];
        const ob = exc.getOrderbook(pair);
        expect(ob).to.be.an.instanceof(Orderbook);
        expect(ob).to.not.be.equal(new Orderbook(pair, 3));

        const ob2 = exc.getOrderbook(pair);
        expect(ob).to.be.equal(ob2);
    });

    it('Should return a candle collection for a trading pair', () => {
        const exc = new MockExchange();
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
        const exc = new MockExchange();
        const addOrder = spy(exc, <any>"addOrder");
        const removeOrder = spy(exc, <any>"removeOrder");
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
});