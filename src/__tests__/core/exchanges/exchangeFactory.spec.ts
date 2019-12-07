import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import RemoteOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/remoteOrderFiller";
import PaperTradingOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/paperTradingOrderFiller";
import LocalOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/localOrderFiller";
import HitBTC, {HitBTCCandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import HitBTCOrderCreator from "../../../sockTrader/core/exchanges/orderCreators/hitBTCOrderCreator";
import LocalOrderCreator from "../../../sockTrader/core/exchanges/orderCreators/localOrderCreator";
import LocalExchange from "../../../sockTrader/core/exchanges/localExchange";


let factory = new ExchangeFactory();
beforeEach(() => {
    factory = new ExchangeFactory();
});

describe("getOrderFiller", () => {
    it("Should return RemoteOrderFiller when using LIVE trading mode", () => {
        process.env.SOCKTRADER_TRADING_MODE = "LIVE";

        const orderFiller = factory["getOrderFiller"]();
        expect(orderFiller).toBeInstanceOf(RemoteOrderFiller);
    });

    it("Should return PaperTradingOrderFiller when using PAPER trading mode", () => {
        process.env.SOCKTRADER_TRADING_MODE = "PAPER";

        const orderFiller = factory["getOrderFiller"]();
        expect(orderFiller).toBeInstanceOf(PaperTradingOrderFiller);
    });

    it("Should return LocalOrderFiller when using BACKTEST trading mode", () => {
        process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

        const orderFiller = factory["getOrderFiller"]();
        expect(orderFiller).toBeInstanceOf(LocalOrderFiller);
    });
});

describe("getExchangeDefinition", () => {
    it("Should return an exchange definition when using a valid exchange name", () => {
        const definition = factory["getExchangeDefinition"]("hitbtc");
        expect(definition).toEqual({
            class: HitBTC,
            orderCreator: HitBTCOrderCreator,
            intervals: {
                "1m": HitBTCCandleInterval.ONE_MINUTE,
                "3m": HitBTCCandleInterval.THREE_MINUTES,
                "5m": HitBTCCandleInterval.FIVE_MINUTES,
                "15m": HitBTCCandleInterval.FIFTEEN_MINUTES,
                "30m": HitBTCCandleInterval.THIRTY_MINUTES,
                "1h": HitBTCCandleInterval.ONE_HOUR,
                "4h": HitBTCCandleInterval.FOUR_HOURS,
                "1d": HitBTCCandleInterval.ONE_DAY,
                "7d": HitBTCCandleInterval.SEVEN_DAYS,
                "1M": HitBTCCandleInterval.ONE_MONTH,
            },
        });
    });

    it("Should return a local exchange definition when no exchange name is given", () => {
        const definition = factory["getExchangeDefinition"]();
        expect(definition).toEqual({
            class: LocalExchange,
            orderCreator: LocalOrderCreator,
            intervals: {},
        });
    });

    it("Should throw when using an valid exchange name", () => {
        const getInvalidDefinition = () => factory["getExchangeDefinition"]("INVALID");
        expect(getInvalidDefinition).toThrow("Could not find exchange: INVALID");
    });
});
