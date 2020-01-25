import {isLocalExchange} from "../../../sockTrader/core/types/exchange";
import LocalOrderCreator from "../../../sockTrader/core/exchanges/orderCreators/localOrderCreator";
import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import LocalOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/localOrderFiller";
import LocalExchange from "../../../sockTrader/core/exchanges/localExchange";
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

    it("Should send processedCandles to the orderFiller", () => {
        const orderFiller = exchange["orderFiller"] as LocalOrderFiller;

        exchange.emitCandles(FX_CANDLE_LIST);

        expect(orderFiller["onProcessCandles"]).toHaveBeenNthCalledWith(1, [...FX_CANDLE_2]);
        expect(orderFiller["onProcessCandles"]).toHaveBeenNthCalledWith(2, [...FX_HISTORICAL_CANDLES, ...FX_CANDLE_2]);
    });

    it("Should notify orderCreator about the current candle", () => {
        const spy = jest.spyOn(exchange["orderCreator"] as LocalOrderCreator, "setCurrentCandle");

        if (isLocalExchange(exchange)) exchange.emitCandles(FX_CANDLE_LIST);

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
