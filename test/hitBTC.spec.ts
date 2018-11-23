/* tslint:disable */
import {assert, expect} from 'chai';
import {describe, it} from 'mocha';
import {stub, spy, fake} from 'sinon';
import Orderbook from '../src/core/orderbook';
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../src/core/orderInterface";
import HitBTC, {CandleInterval} from '../src/core/exchanges/hitBTC';
import moment = require("moment");

const pair = 'BTCETH';

describe('HitBTC', () => {
    const getOrder = (): IOrder => ({
        clientOrderId: '4559a45057ded19e04d715c4b40f7ddd',
        createdAt: moment(),
        cumQuantity: 0,
        id: '38727737188',
        price: 0.001263,
        quantity: 0.02,
        reportType: ReportType.NEW,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        symbol: pair,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.MARKET,
        updatedAt: moment(),
    })

    const getExchange = () => {
        const exc = new HitBTC();
        return {send: stub(exc, 'send'), exc};
    };

    it('get exchange orderbook', () => {
        const exc = new HitBTC();
        const ob1 = new Orderbook(pair, 6);

        // No configuration given
        expect(() => exc.getOrderbook(pair)).to.throw();

        exc['currencies'] = [{id: pair, quantityIncrement: 10, tickSize: 0.000001}];

        // Returns a new empty orderbook
        expect(exc.getOrderbook(pair)).to.deep.equal({pair, precision: 6, ask: [], bid: []});

        ob1.setOrders([
            {price: 0.074819, size: 100},
            {price: 0.074817, size: 100},
            {price: 0.074834, size: 2500},
        ], [
            {price: 0.074940, size: 451},
            {price: 0.074944, size: 2000},
            {price: 0.074925, size: 100},
        ]);
        exc['orderbooks'] = {[pair]: ob1};

        // Returns filled orderbook
        expect(exc.getOrderbook(pair)).to.deep.equal(ob1);
        expect(exc.getOrderbook(pair).ask[0]).to.deep.equal({price: 0.074817, size: 100});
        expect(exc.getOrderbook(pair).bid[0]).to.deep.equal({price: 0.074944, size: 2000});
    });

    it('onCreate lifecycle', () => {
        const onCreate = spy(HitBTC.prototype, 'onCreate');
        const exc1 = HitBTC.getInstance();
        const exc2 = HitBTC.getInstance();

        assert.isTrue(onCreate.calledOnce);
        assert.deepEqual(onCreate.getCall(0).args, []);
        onCreate.restore();
    });

    it('subscribe to exchange reports', () => {
        const {exc, send} = getExchange();
        exc.subscribeReports();
        assert.deepEqual(send.getCall(0).args, ['subscribeReports']);
        send.reset();
    });

    it('subscribe to orderbook for given pair', () => {
        const {exc, send} = getExchange();
        exc.subscribeOrderbook(pair);
        assert.deepEqual(send.getCall(0).args, ['subscribeOrderbook', {symbol: pair}]);
        send.reset();
    });

    it('subscribe to candles for given pair', () => {
        const {exc, send} = getExchange();
        exc.subscribeCandles(pair, CandleInterval.ONE_MONTH);
        assert.deepEqual(send.getCall(0).args, ['subscribeCandles', {period: '1M', symbol: pair}]);
        send.reset();
    });

    it('should authenticate user on exchange', () => {
        const {exc, send} = getExchange();
        exc.login('PUB_123', 'PRIV_123');
        expect(send.getCall(0).args[0]).to.equal('login');
        expect(send.getCall(0).args[1]).to.deep.include({algo: 'HS256', pKey: 'PUB_123'});
        send.reset();
    });

    it('should update an in memory orderbook', () => {
        const exc = new HitBTC();
        const emit = stub(exc, 'emit');

        exc['currencies'] = [{id: pair, quantityIncrement: 10, tickSize: 0.000001}];
        exc.onUpdateOrderbook({
            sequence: 1,
            symbol: pair,
            ask: [{price: 0.0015, size: 100}],
            bid: [{price: 0.001391, size: 40}],
        }, 'setOrders');
        expect(emit.getCall(0).args).to.deep.equal([
            'app.updateOrderbook', {
                ask: [{price: 0.0015, size: 100}],
                bid: [{price: 0.001391, size: 40}],
                pair: 'BTCETH',
                precision: 6,
            },
        ]);
        emit.reset();
    });

    it('should load configuration for all currencies', () => {
        const {exc, send} = getExchange();
        const isReady = spy(exc, 'isReady');

        exc.loadCurrencies();
        expect(send.getCall(0).args).to.deep.equal(['getSymbols']);

        exc.mapper.onReceive({
            type: "utf8",
            utf8Data: JSON.stringify({
                id: "getSymbols",
                method: "getSymbols",
                result: [
                    {
                        id: "BTCUSD",
                        tickSize: "0.000001",
                        quantityIncrement: "0.001",
                    }
                ]
            }),
        });

        expect(isReady.calledOnce).to.deep.equal(true);
        expect(exc["isCurrenciesLoaded"]).to.equal(true);
        expect(exc["currencies"]).to.deep.equal([{
            "id": "BTCUSD",
            "quantityIncrement": 0.001,
            "tickSize": 0.000001
        }]);

        isReady.restore();
        send.reset();
    });

    it('should cancel an order', () => {
        const {exc, send} = getExchange();
        exc['setOrderInProgress'] = fake();
        exc.cancelOrder(getOrder());
        expect(send.getCall(0).args).to.deep.equal(['cancelOrder', {clientOrderId: '4559a45057ded19e04d715c4b40f7ddd'}]);
    });

    it('adjust existing order', () => {
        const {exc, send} = getExchange();
        exc.adjustOrder(getOrder(), 0.002, 0.5);
        expect(send.getCall(0).args[0]).to.deep.equal('cancelReplaceOrder');
        expect(send.getCall(0).args[1]).to.deep.include({
            clientOrderId: '4559a45057ded19e04d715c4b40f7ddd',
            price: 0.002,
            quantity: 0.5,
            strictValidate: true,
        });
    });

    it('is adjusting allowed', () => {
        const exc = new HitBTC();
        const order = getOrder();

        expect(exc['isAdjustingOrderAllowed'](order, 0.002, 0.02)).to.equal(true);
        expect(exc['isAdjustingOrderAllowed'](order, 0.002, 0.02)).to.equal(false);

        exc['orderInProgress'] = {};
        expect(exc['isAdjustingOrderAllowed'](order, 0.001263, 0.02)).to.equal(false);
    });

    it('generate new order id', () => {
        const exc = new HitBTC();
        expect(exc['generateOrderId'](pair).length).to.be.equal(32);
        expect(exc['generateOrderId'](pair)).to.be.an('string');
    });

    it('get open orders', () => {
        const exc = new HitBTC();
        const order = getOrder();

        expect(exc['getOpenOrders']()).to.deep.eq([]);

        exc['addOrder'](order);
        expect(exc['getOpenOrders']()).to.deep.eq([order]);
    });

});