import moment from "moment";
import {connection} from "websocket";
import {EventEmitter} from "events";
import {IOrderbookData} from "../../sockTrader/core/exchanges/baseExchange";
import {Pair} from "../../sockTrader/core/types/pair";
import HitBTC, {CandleInterval} from "../../sockTrader/core/exchanges/hitBTC";
import {IOrder, OrderSide} from "../../sockTrader/core/types/order";
import {ICandle} from "../../sockTrader/core/candles/candleManager";
import Orderbook from "../../sockTrader/core/orderbook";

const pair: Pair = ["BTC", "USD"];

function createExchange() {
    const exchange = new HitBTC("PUB_123", "SEC_123");
    exchange.send = jest.fn();

    return exchange;
}

let exchange = createExchange();
beforeEach(() => {
    exchange = createExchange();
});

describe("getInstance", () => {
    test("Should trigger the onCreate lifecycle event", () => {
        const spyOnCreate = spyOn(HitBTC.prototype, "onCreate");
        HitBTC.getInstance();
        HitBTC.getInstance();

        expect(spyOnCreate).toBeCalledTimes(1);
    });
});

describe("subscribeReports", () => {
    test("Should send out a subscribe to report events", () => {
        exchange.subscribeReports();
        expect(exchange.send).toBeCalledWith("subscribeReports");
    });
});

describe("subscribeOrderbook", () => {
    test("Should send out a subscribe to orderbook events", () => {
        exchange.subscribeOrderbook(pair);
        expect(exchange.send).toBeCalledWith("subscribeOrderbook", expect.objectContaining({symbol: "BTCUSD"}));
    });
});

describe("subscribeCandles", () => {
    test("Should send out subscribe to candle events", () => {
        exchange.subscribeCandles(pair, CandleInterval.FIVE_MINUTES);
        expect(exchange.send).toBeCalledWith("subscribeCandles", expect.objectContaining({
            period: "M5",
            symbol: "BTCUSD",
        }));
    });
});

describe("login", () => {
    test("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");
        expect(exchange.send).toBeCalledWith("login", expect.objectContaining({
            "algo": "HS256",
            "pKey": "PUB_123",
            "signature": expect.any(String),
            "nonce": expect.any(String),
        }));
    });
});

describe("onSnapshotCandles", () => {
    test("Should set candles in candle manager when snapshot has been received", () => {
        const set = jest.fn();
        exchange.getCandleManager = jest.fn(() => ({set})) as any;

        const candles: ICandle[] = [{close: 1, high: 2, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle];

        exchange.onSnapshotCandles(pair, candles, CandleInterval.FIVE_MINUTES);
        expect(set).toBeCalled();
    });
});

describe("onUpdateOrderbook", () => {
    function createOrderbook() {
        const orderbook = new Orderbook(["BTC", "USD"], 6);
        orderbook.setOrders = jest.fn();
        orderbook.addIncrement = jest.fn();

        return orderbook;
    }

    test("Should update an in memory orderbook", () => {
        const orderbook = createOrderbook();
        const getOrderbook = jest.fn(() => orderbook);

        exchange.getOrderbook = getOrderbook;
        exchange.emit = jest.fn();

        const ob: IOrderbookData = {
            sequence: 1,
            pair,
            ask: [{price: 0.0015, size: 100}],
            bid: [{price: 0.001391, size: 40}],
        };

        exchange.onUpdateOrderbook(ob);
        expect(getOrderbook).toBeCalled();
        expect(orderbook.addIncrement).toBeCalledWith([{price: 0.0015, size: 100}], [{price: 0.001391, size: 40}], 1);
        expect(exchange.emit).toBeCalledWith("core.updateOrderbook", expect.objectContaining({
            pair: ["BTC", "USD"],
            precision: 6,
        }));
    });
});

describe("loadCurrencies", () => {
    it("Should load currency configuration from the exchange", () => {
        exchange.loadCurrencies();
        expect(exchange.send).toBeCalledWith("getSymbols");
    });
});

describe("cancelOrder", () => {
    it("Should cancel an order", () => {
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(setOrderInProgressMock).toBeCalledWith("123");
        expect(exchange.send).toBeCalledWith("cancelOrder", {clientOrderId: "123"});
    });
});

describe("adjustOrder", () => {
    it("Should adjust existing orders", () => {
        exchange["isAdjustingAllowed"] = jest.fn(() => true);
        exchange.generateOrderId = jest.fn(() => "neworderid");

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(exchange.send).toBeCalledWith("cancelReplaceOrder", expect.objectContaining({
            clientOrderId: "123",
            price: 0.002,
            quantity: 0.5,
            strictValidate: true,
            requestClientId: "neworderid",
        }));
    });
});

describe("createOrder", () => {
    it("Should create a new order", () => {
        exchange.generateOrderId = jest.fn(() => "FAKE_ORDER_ID");
        exchange["createOrder"](pair, 10, 1, OrderSide.BUY);

        expect(exchange.send).toBeCalledWith("newOrder", expect.objectContaining({
            price: 10,
            quantity: 1,
            side: "buy",
            symbol: pair,
            type: "limit",
            clientOrderId: "FAKE_ORDER_ID",
        }));
    });
});

describe("onConnect", () => {
    test("Should initialize when exchange is connected", () => {
        exchange.loadCurrencies = jest.fn();
        exchange.login = jest.fn();
        exchange.adapter.onReceive = jest.fn();

        const connectionMock = new EventEmitter();
        exchange["onConnect"](connectionMock as connection);

        const message = JSON.stringify({test: "123"});
        connectionMock.emit("message", message);

        expect(exchange.adapter.onReceive).toBeCalledWith(message);
        expect(exchange.loadCurrencies).toBeCalledTimes(1);
        expect(exchange.login).toBeCalledWith("PUB_123", "SEC_123");
    });
});

describe("connect", () => {
    it("Should connect", () => {
        exchange.connect();
        expect(exchange["socketClient"].connect).toBeCalledWith("wss://api.hitbtc.com/api/2/ws");
    });
});
