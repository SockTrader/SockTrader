/* tslint:disable */
import "jest";
import moment from "moment";
import {connection} from "websocket";
import {EventEmitter} from "events";
import {IOrderbookData} from "../../sockTrader/core/exchanges/baseExchange";
import Orderbook from "../../sockTrader/core/orderbook";
import {Pair} from "../../sockTrader/core/types/pair";
import HitBTC, {CandleInterval} from "../../sockTrader/core/exchanges/hitBTC";
import {IOrder, OrderSide} from "../../sockTrader/core/types/order";
import CandleManager, {ICandle} from "../../sockTrader/core/candles/candleManager";

const pair: Pair = ["BTC", "USD"];

let exchange = new HitBTC("PUB_123", "SEC_123");
let sendMock = jest.fn();

beforeEach(() => {
    exchange = new HitBTC("PUB_123", "SEC_123");
    exchange.send = sendMock;
});

afterEach(() => {
    sendMock.mockRestore();
})

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
        expect(sendMock).toBeCalledWith("subscribeReports");
    });
});

describe("subscribeOrderbook", () => {
    test("Should send out a subscribe to orderbook events", () => {
        exchange.subscribeOrderbook(pair);
        expect(sendMock).toBeCalledWith("subscribeOrderbook", expect.objectContaining({symbol: "BTCUSD"}));
    });
});

describe("subscribeCandles", () => {
    test("Should send out subscribe to candle events", () => {
        exchange.subscribeCandles(pair, CandleInterval.FIVE_MINUTES);
        expect(sendMock).toBeCalledWith("subscribeCandles", expect.objectContaining({period: "M5", symbol: "BTCUSD"}));
    });
});

describe("login", () => {
    test("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");
        expect(sendMock).toBeCalledWith("login", expect.objectContaining({"algo": "HS256", "pKey": "PUB_123"}));
        expect(sendMock.mock.calls[0][1]).toHaveProperty("signature");
        expect(sendMock.mock.calls[0][1]).toHaveProperty("nonce");
    });
});

describe("onUpdateCandles", () => {
    test("Should update a candle manager for a trading pair with method set", () => {
        const collection = new CandleManager(CandleInterval.FIVE_MINUTES);
        exchange.getCandleManager = jest.fn(() => collection);
        const set = spyOn(collection, "set");

        const candles: ICandle[] = [{close: 1, high: 2, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle];

        exchange.onUpdateCandles(pair, candles, CandleInterval.FIVE_MINUTES, "set");
        expect(set).toBeCalled();
    });
});

describe("onUpdateOrderbook", () => {
    test("Should update an in memory orderbook", () => {
        const emit = jest.fn();
        exchange.emit = emit;

        const orderbook: Orderbook = new Orderbook(pair, 6);
        orderbook.setOrders = jest.fn();
        const getOrderbookMock = jest.fn(() => orderbook);
        exchange.getOrderbook = getOrderbookMock;

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

        const {pair: symbol} = ob;
        exchange.currencies[pair.join("")] = {id: pair, quantityIncrement: 10, tickSize: 0.000001};

        exchange.onUpdateOrderbook({...ob, sequence: -1}, "setOrders");
        expect(getOrderbookMock).not.toBeCalled();

        exchange.onUpdateOrderbook(ob, "setOrders");
        expect(getOrderbookMock).toBeCalled();
        expect(emit).toBeCalledWith("core.updateOrderbook", expect.objectContaining({pair: symbol, precision: 6}));
    });
});

describe("loadCurrencies", () => {
    it("Should load currency configuration from the exchange", () => {
        exchange.loadCurrencies();
        expect(sendMock).toBeCalledWith("getSymbols");
    });
});

describe("cancelOrder", () => {
    it("Should cancel an order", () => {
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(setOrderInProgressMock).toBeCalledWith("123");
        expect(sendMock).toBeCalledWith("cancelOrder", {clientOrderId: "123"});
    });
});

describe("adjustOrder", () => {
    it("Should adjust existing orders", () => {
        exchange["isAdjustingOrderAllowed"] = jest.fn(() => true);
        exchange.generateOrderId = jest.fn(() => "neworderid");

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(sendMock).toBeCalledWith("cancelReplaceOrder", expect.objectContaining({
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

        expect(sendMock).toBeCalledWith("newOrder", expect.objectContaining({
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
        const loadCurrenciesMock = jest.fn();
        exchange.loadCurrencies = loadCurrenciesMock;
        const onReceiveMock = jest.fn();
        const loginMock = jest.fn();
        exchange.login = loginMock;
        exchange.adapter.onReceive = onReceiveMock;

        const connectionMock = new EventEmitter();
        exchange["onConnect"](connectionMock as connection);

        expect(loadCurrenciesMock).toBeCalled();
        expect(loginMock).toBeCalledWith("PUB_123", "SEC_123");

        connectionMock.emit("message", JSON.stringify({test: "123"}));

        expect(onReceiveMock).toBeCalledWith(JSON.stringify({test: "123"}));
    });
});

describe("connect", () => {
    it("Should connect", () => {
        const connectMock = jest.fn();
        // @ts-ignore
        exchange.__proto__.__proto__.connect = connectMock;

        exchange.connect();
        expect(connectMock).toBeCalledWith("wss://api.hitbtc.com/api/2/ws");
    });
});
