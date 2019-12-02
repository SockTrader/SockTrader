import OrderTracker from "../../order/orderTracker";
import Wallet from "../../plugins/wallet/wallet";
import {Candle} from "../../types/Candle";
import {CandleInterval} from "../../types/CandleInterval";
import {OrderFiller} from "../../types/OrderFiller";
import {Pair} from "../../types/pair";
import LocalOrderFiller from "./localOrderFiller";
import RemoteOrderFiller from "./remoteOrderFiller";

export default class PaperTradingOrderFiller implements OrderFiller {

    private localCandleProcessor: LocalOrderFiller;
    private remoteCandleProcessor: RemoteOrderFiller;

    constructor(readonly orderTracker: OrderTracker, readonly wallet: Wallet) {
        this.localCandleProcessor = new LocalOrderFiller(orderTracker, wallet);
        this.remoteCandleProcessor = new RemoteOrderFiller();
    }

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.localCandleProcessor.onSnapshotCandles(pair, data, interval);
        this.remoteCandleProcessor.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.localCandleProcessor.onUpdateCandles(pair, data, interval);
        this.remoteCandleProcessor.onUpdateCandles(pair, data, interval);
    }
}
