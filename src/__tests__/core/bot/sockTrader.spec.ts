import SimpleMovingAverage from "../../../strategies/simpleMovingAverage";
import SockTrader from "../../../sockTrader/core/bot/sockTrader";
import {default as HitBTC, HitBTCCandleInterval} from "../../../sockTrader/core/exchange/hitBTC";
import {Pair} from "../../../sockTrader/core/types/pair";
import Events from "../../../sockTrader/core/events";
import {FX_NEW_BUY_ORDER, FX_REPLACED_BUY_ORDER} from "../../../__fixtures__/order";
import {FX_ASK, FX_BID} from "../../../__fixtures__/orderbook";
import Orderbook from "../../../sockTrader/core/orderbook/orderbook";
import {FX_CANDLE_LIST} from "../../../__fixtures__/candles";
import OrderLogger from "../../../sockTrader/core/plugins/logging/orderLogger";
import WalletLogger from "../../../sockTrader/core/plugins/logging/walletLogger";
import SpreadLogger from "../../../sockTrader/core/plugins/logging/spreadLogger";
import {Signal} from "../../../sockTrader/core/strategy/baseStrategy";
import {OrderSide} from "../../../sockTrader/core/types/order";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

class ConcreteSockTrader extends SockTrader {
}

const BTCETH: Pair = ["BTC", "ETH"];

let hitBTC: HitBTC;
let sockTrader: ConcreteSockTrader;

beforeEach(() => {
    jest.clearAllMocks();

    hitBTC = new HitBTC();

    sockTrader = new ConcreteSockTrader();
    sockTrader["exchange"] = hitBTC;
});

afterEach(() => {
    hitBTC.destroy();
    Events.removeAllListeners();
});

describe("constructor", () => {
    it("Should have an empty array of plugins when created", () => {
        expect(sockTrader["plugins"]).toEqual([]);
    });
});

describe("subscribeToExchangeEvents", () => {
    beforeEach(() => {
        hitBTC.subscribeReports = jest.fn();
        hitBTC.subscribeOrderbook = jest.fn();
        hitBTC.subscribeCandles = jest.fn();
    });

    it("Should subscribe once to orderbook, reports and candles", () => {
        sockTrader.subscribeToExchangeEvents({
            strategy: SimpleMovingAverage,
            pair: BTCETH,
            interval: HitBTCCandleInterval.FIVE_MINUTES,
        });
        hitBTC.emit("ready");

        expect(hitBTC.subscribeReports).toBeCalledTimes(1);
        expect(hitBTC.subscribeOrderbook).toBeCalledTimes(1);
        expect(hitBTC.subscribeOrderbook).toBeCalledWith(BTCETH);
        expect(hitBTC.subscribeCandles).toBeCalledTimes(1);
        expect(hitBTC.subscribeCandles).toBeCalledWith(BTCETH, HitBTCCandleInterval.FIVE_MINUTES);
    });

    it("Should NOT subscribe candles if interval is empty", () => {
        sockTrader.subscribeToExchangeEvents({strategy: SimpleMovingAverage, pair: BTCETH});
        hitBTC.emit("ready");

        expect(hitBTC.subscribeCandles).toBeCalledTimes(0);
    });
});

describe("bindEventsToPlugins", () => {
    const orderbook = new Orderbook(["BTC", "USD"]).setOrders(FX_ASK, FX_BID, 1);
    let spyOn: any;
    beforeEach(() => {
        spyOn = jest.spyOn(Events, "on");
    });

    afterEach(() => {
        hitBTC.destroy();
        Events.removeAllListeners();
    });

    it("Should notify plugins about core.report events", () => {
        const plugin = new OrderLogger();
        const spy = jest.spyOn(plugin, "onReport").mockImplementation();

        sockTrader["bindEventsToPlugins"]([plugin]);
        Events.emit("core.report", FX_NEW_BUY_ORDER);

        expect(spyOn).toBeCalledWith("core.report", expect.any(Function));
        expect(spy).toBeCalledWith(FX_NEW_BUY_ORDER);
    });

    it("Should notify plugins about core.updateAssets events", () => {
        const plugin = new WalletLogger();
        const spy = jest.spyOn(plugin, "onUpdateAssets").mockImplementation();

        sockTrader["bindEventsToPlugins"]([plugin]);
        Events.emit("core.updateAssets", FX_REPLACED_BUY_ORDER, FX_NEW_BUY_ORDER);

        expect(spyOn).toBeCalledWith("core.updateAssets", expect.any(Function));
        expect(spy).toBeCalledWith(FX_REPLACED_BUY_ORDER, FX_NEW_BUY_ORDER);
    });

    it("Should notify plugins about core.updateOrderbook events", () => {
        const plugin = new SpreadLogger();
        const spy = jest.spyOn(plugin, "onUpdateOrderbook").mockImplementation();

        sockTrader["bindEventsToPlugins"]([plugin]);
        Events.emit("core.updateOrderbook", orderbook);

        expect(spyOn).toBeCalledWith("core.updateOrderbook", expect.any(Function));
        expect(spy).toBeCalledWith(orderbook);
    });
});

describe("bindExchangeToStrategy", () => {
    const strategy = new SimpleMovingAverage(BTCETH, hitBTC);
    const orderbook = new Orderbook(["BTC", "USD"]).setOrders(FX_ASK, FX_BID, 1);

    let spyOn: any;
    beforeEach(() => {
        spyOn = jest.spyOn(Events, "on");
    });

    afterEach(() => {
        hitBTC.destroy();
        Events.removeAllListeners();
    });

    it("Should notify the strategy about core.report events", () => {
        const spyStrategy = jest.spyOn(strategy, "notifyOrder");

        sockTrader["bindExchangeToStrategy"](strategy);
        Events.emit("core.report", FX_NEW_BUY_ORDER);

        expect(spyOn).toBeCalledWith("core.report", expect.any(Function));
        expect(spyStrategy).toBeCalledWith(FX_NEW_BUY_ORDER);
    });

    it("Should notify the strategy about core.snapshotOrderbook events", () => {
        const spyStrategy = jest.spyOn(strategy, "updateOrderbook");

        sockTrader["bindExchangeToStrategy"](strategy);
        Events.emit("core.snapshotOrderbook", orderbook);

        expect(spyOn).toBeCalledWith("core.snapshotOrderbook", expect.any(Function));
        expect(spyStrategy).toBeCalledWith(orderbook);
    });

    it("Should notify the strategy about core.updateOrderbook events", () => {
        const spyStrategy = jest.spyOn(strategy, "updateOrderbook");

        sockTrader["bindExchangeToStrategy"](strategy);
        Events.emit("core.updateOrderbook", orderbook);

        expect(spyOn).toBeCalledWith("core.updateOrderbook", expect.any(Function));
        expect(spyStrategy).toBeCalledWith(orderbook);
    });

    it("Should notify the strategy about core.snapshotCandles events", () => {
        const spyStrategy = jest.spyOn(strategy, "_onSnapshotCandles");

        sockTrader["bindExchangeToStrategy"](strategy);
        Events.emit("core.snapshotCandles", FX_CANDLE_LIST);

        expect(spyOn).toBeCalledWith("core.snapshotCandles", expect.any(Function));
        expect(spyStrategy).toBeCalledWith(FX_CANDLE_LIST);
    });

    it("Should notify the strategy about core.updateCandles events", () => {
        const spyStrategy = jest.spyOn(strategy, "_onUpdateCandles");

        sockTrader["bindExchangeToStrategy"](strategy);
        Events.emit("core.updateCandles", FX_CANDLE_LIST);

        expect(spyOn).toBeCalledWith("core.updateCandles", expect.any(Function));
        expect(spyStrategy).toBeCalledWith(FX_CANDLE_LIST);
    });
});

describe("bindStrategyToExchange", () => {
    it("Should notify exchange about core.signal events", () => {
        hitBTC.createOrder = jest.fn();
        const simpleMovingAverage: SimpleMovingAverage = new SimpleMovingAverage(BTCETH, hitBTC);
        const spyOn = jest.spyOn(simpleMovingAverage, "on");

        sockTrader["bindStrategyToExchange"](simpleMovingAverage);
        simpleMovingAverage.emit("core.signal", {
            symbol: ["BTC", "USD"],
            price: 10,
            qty: 1,
            side: OrderSide.BUY,
        } as Signal);

        expect(spyOn).toBeCalledWith("core.signal", expect.any(Function));
        expect(hitBTC.createOrder).toBeCalledWith(["BTC", "USD"], 10, 1, OrderSide.BUY);
    });

    it("Should notify exchange about core.adjustOrder events", () => {
        hitBTC.adjustOrder = jest.fn();
        const simpleMovingAverage: SimpleMovingAverage = new SimpleMovingAverage(BTCETH, hitBTC);
        const spyOn = jest.spyOn(simpleMovingAverage, "on");

        sockTrader["bindStrategyToExchange"](simpleMovingAverage);
        simpleMovingAverage.emit("core.adjustOrder", {order: FX_NEW_BUY_ORDER, price: 10, qty: 1});

        expect(spyOn).toBeCalledWith("core.adjustOrder", expect.any(Function));
        expect(hitBTC.adjustOrder).toBeCalledWith(FX_NEW_BUY_ORDER, 10, 1);
    });
});
