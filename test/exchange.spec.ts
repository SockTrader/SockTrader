/* tslint:disable */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {spy} from 'sinon';
import Exchange from "../src/core/exchanges/exchange";
import {OrderSide} from "../src/core/orderInterface";

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
});