import moment from "moment";
import {EventEmitter} from "events";
import {Pair} from "../../../sockTrader/core/types/pair";
import HitBTC, {CandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import {IOrder, OrderSide} from "../../../sockTrader/core/types/order";
import Orderbook from "../../../sockTrader/core/orderbook";
import {IOrderbookData} from "../../../sockTrader/core/types/IOrderbookData";
import {ICandle} from "../../../sockTrader/core/types/ICandle";
import WebSocket from "../../../sockTrader/core/connection/webSocket";

jest.mock("./../../../config");

const pair: Pair = ["BTC", "USD"];

function createExchange() {
    const exchange = new HitBTC();
    exchange.send = jest.fn();

    return exchange;
}

let exchange = createExchange();
beforeEach(() => {
    exchange = createExchange();
});

describe("subscribeReports", () => {
    test("Should send out a subscribe to report events", () => {
        exchange.subscribeReports();
        expect(exchange.send).toBeCalledWith(expect.objectContaining({
            id: "subscribeReports",
            method: "subscribeReports",
            params: {},
        }));
    });
});

describe("subscribeOrderbook", () => {
    test("Should send out a subscribe to orderbook events", () => {
        exchange.subscribeOrderbook(pair);
        expect(exchange.send).toBeCalledWith(
            expect.objectContaining({
                id: "subscribeOrderbook",
                method: "subscribeOrderbook",
                params: {symbol: "BTCUSD"},
            }),
        );
    });
});

describe("subscribeCandles", () => {
    test("Should send out subscribe to candle events", () => {
        exchange.subscribeCandles(pair, CandleInterval.FIVE_MINUTES);
        expect(exchange.send).toBeCalledWith(
            expect.objectContaining({
                id: "subscribeCandles",
                method: "subscribeCandles",
                params: {period: "M5", symbol: "BTCUSD"},
            }),
        );
    });
});

describe("login", () => {
    test("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");
        expect(exchange.send).toBeCalledWith(
            expect.objectContaining({
                id: "login",
                method: "login",
                params: {
                    algo: "HS256",
                    pKey: "PUB_123",
                    signature: expect.any(String),
                    nonce: expect.any(String),
                },
            }),
        );
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
        expect(exchange.send).toBeCalledWith(expect.objectContaining({
            id: "getSymbols",
            method: "getSymbols",
            params: {},
        }));
    });
});

describe("cancelOrder", () => {
    it("Should cancel an order", () => {
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(setOrderInProgressMock).toBeCalledWith("123");
        expect(exchange.send).toBeCalledWith(expect.objectContaining({
            id: "cancelOrder",
            method: "cancelOrder",
            params: {
                clientOrderId: "123",
            },
        }));
    });
});

describe("adjustOrder", () => {
    it("Should adjust existing orders", () => {
        exchange["isAdjustingAllowed"] = jest.fn(() => true);

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(exchange.send).toBeCalledWith(expect.objectContaining({
            id: "cancelReplaceOrder",
            method: "cancelReplaceOrder",
            params: {
                clientOrderId: "123",
                price: 0.002,
                quantity: 0.5,
                strictValidate: true,
                requestClientId: expect.any(String),
            },
        }));
    });
});

describe("createOrder", () => {
    it("Should create a new order", () => {
        exchange["createOrder"](pair, 10, 1, OrderSide.BUY);

        expect(exchange.send).toBeCalledWith(expect.objectContaining({
            id: "newOrder",
            method: "newOrder",
            params: {
                price: 10,
                quantity: 1,
                side: "buy",
                symbol: pair,
                type: "limit",
                clientOrderId: expect.any(String),
            },
        }));
    });
});

describe("onConnect", () => {
    test("Should initialize when exchange is connected", () => {
        exchange.loadCurrencies = jest.fn();
        exchange.login = jest.fn();
        exchange.adapter.onReceive = jest.fn();

        exchange["onFirstConnect"]();
        // @ts-ignore
        exchange.getConnection = jest.fn(() => new EventEmitter());

        const message = JSON.stringify({test: "123"});
        exchange["connection"].emit("message", message);

        expect(exchange.adapter.onReceive).toBeCalledWith(message);
        expect(exchange.loadCurrencies).toBeCalledTimes(1);
        expect(exchange.login).toBeCalledWith("pub_key", "sec_key");
    });
});

describe("createConnection", () => {
    it("Should create a new websocket connection", () => {
        const connection = exchange["createConnection"]();
        expect(connection).toBeInstanceOf(WebSocket)
    });
});
