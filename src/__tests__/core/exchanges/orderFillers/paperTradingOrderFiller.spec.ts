import {HitBTCCandleInterval} from "../../../../sockTrader/core/exchanges/hitBTC";
import {FX_HISTORICAL_CANDLES} from "../../../../__fixtures__/candles";
import PaperTradingOrderFiller from "../../../../sockTrader/core/exchanges/orderFillers/paperTradingOrderFiller";
import OrderTracker from "../../../../sockTrader/core/order/orderTracker";
import {FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";
import Wallet from "../../../../sockTrader/core/plugins/wallet/wallet";

function createOrderFiller() {
    const tracker = new OrderTracker();
    tracker.setOpenOrders([FX_NEW_BUY_ORDER]);

    return new PaperTradingOrderFiller(tracker, new Wallet({BTC: 10, USD: 10000}));
}

const interval = HitBTCCandleInterval.ONE_MINUTE;
let orderFiller = createOrderFiller();
beforeEach(() => {
    orderFiller = createOrderFiller();
});

test("Should fill orders by using the LocalOrderFiller", () => {
    const spy1 = jest.spyOn(orderFiller["localOrderFiller"], "onSnapshotCandles");
    const spy2 = jest.spyOn(orderFiller["localOrderFiller"], "onUpdateCandles");

    orderFiller.onSnapshotCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
    orderFiller.onUpdateCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);

    expect(spy1).toBeCalledWith(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
    expect(spy2).toBeCalledWith(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
});

test("Should update internal list of candles by using the RemoteOrderFiller", () => {
    const spy1 = jest.spyOn(orderFiller["remoteOrderFiller"], "onSnapshotCandles");
    const spy2 = jest.spyOn(orderFiller["remoteOrderFiller"], "onUpdateCandles");

    orderFiller.onSnapshotCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
    orderFiller.onUpdateCandles(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);

    expect(spy1).toBeCalledWith(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
    expect(spy2).toBeCalledWith(["BTC", "USD"], FX_HISTORICAL_CANDLES, interval);
});

