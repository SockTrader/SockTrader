import {isLocalExchange} from "../../../sockTrader/core/types/exchange";
import LocalOrderCreator from "../../../sockTrader/core/exchange/orderCreators/localOrderCreator";
import ExchangeFactory from "../../../sockTrader/core/exchange/exchangeFactory";
import LocalOrderFiller from "../../../sockTrader/core/exchange/orderFillers/localOrderFiller";
import LocalExchange from "../../../sockTrader/core/exchange/localExchange";
import {FX_CANDLE_2, FX_CANDLE_LIST, FX_HISTORICAL_CANDLES} from "../../../__fixtures__/candles";
import LocalConnection from "../../../sockTrader/core/connection/localConnection";

process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

let exchange: LocalExchange;
beforeEach(() => {
    exchange = new ExchangeFactory().createExchange("local") as LocalExchange;
});

describe("emitCandles", () => {
    beforeEach(() => {
        (exchange["orderFiller"] as LocalOrderFiller)["onProcessCandles"] = jest.fn();
    });

    it("Should send processedCandles to the orderFiller", async () => {
        const orderFiller = exchange["orderFiller"] as LocalOrderFiller;

        await exchange.emitCandles(FX_CANDLE_LIST, ["BTC", "USD"]);

        expect(orderFiller["onProcessCandles"]).toHaveBeenNthCalledWith(1, [...FX_CANDLE_2]);
        expect(orderFiller["onProcessCandles"]).toHaveBeenNthCalledWith(2, [...FX_HISTORICAL_CANDLES, ...FX_CANDLE_2]);
    });

    it("Should notify orderCreator about the current candle", async () => {
        const spy = jest.spyOn(exchange["orderCreator"] as LocalOrderCreator, "setCurrentCandle");

        if (isLocalExchange(exchange)) await exchange.emitCandles(FX_CANDLE_LIST, ["BTC", "USD"]);

        expect(spy).toHaveBeenNthCalledWith(1, FX_CANDLE_2[0]);
        expect(spy).toHaveBeenNthCalledWith(2, FX_HISTORICAL_CANDLES[0]);
    });
});

describe("createConnection", () => {
    it("Should return a local connection", () => {
        const connection = exchange["createConnection"]();
        expect(connection).toBeInstanceOf(LocalConnection);
    });
});

describe("ignore methods on LocalExchange", () => {
    it("Should do nothing when 'onUpdateOrderbook' is triggered", () => {
        const result = exchange.onUpdateOrderbook(undefined as any);
        expect(exchange.onUpdateOrderbook.toString()).toMatch(/return undefined/);
        expect(result).toEqual(undefined);
    });

    it("Should do nothing when 'subscribeCandles' is triggered", () => {
        const result = exchange.subscribeCandles(undefined as any, undefined as any);
        expect(exchange.subscribeCandles.toString()).toMatch(/return undefined/);
        expect(result).toEqual(undefined);
    });

    it("Should do nothing when 'subscribeOrderbook' is triggered", () => {
        const result = exchange.subscribeOrderbook(undefined as any);
        expect(exchange.subscribeOrderbook.toString()).toMatch(/return undefined/);
        expect(result).toEqual(undefined);
    });

    it("Should do nothing when 'subscribeReports' is triggered", () => {
        const result = exchange.subscribeReports();
        expect(exchange.subscribeReports.toString()).toMatch(/return undefined/);
        expect(result).toEqual(undefined);
    });

    it("Should do nothing when 'loadCurrencies' is triggered", () => {
        const result = exchange["loadCurrencies"]();
        expect(exchange["loadCurrencies"].toString()).toMatch(/return undefined/);
        expect(result).toEqual(undefined);
    });
});
