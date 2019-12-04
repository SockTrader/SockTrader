import OrderTracker from "../../order/orderTracker";
import Wallet from "../../plugins/wallet/wallet";
import {Candle} from "../../types/Candle";
import {CandleInterval} from "../../types/CandleInterval";
import {OrderFiller} from "../../types/OrderFiller";
import {Pair} from "../../types/pair";
import LocalOrderFiller from "./localOrderFiller";
import RemoteOrderFiller from "./remoteOrderFiller";

export default class PaperTradingOrderFiller implements OrderFiller {

    private localOrderFiller: LocalOrderFiller;
    private remoteOrderFiller: RemoteOrderFiller;

    constructor(readonly orderTracker: OrderTracker, readonly wallet: Wallet) {
        this.localOrderFiller = new LocalOrderFiller(orderTracker, wallet);
        this.remoteOrderFiller = new RemoteOrderFiller();
    }

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.localOrderFiller.onSnapshotCandles(pair, data, interval);
        this.remoteOrderFiller.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.localOrderFiller.onUpdateCandles(pair, data, interval);
        this.remoteOrderFiller.onUpdateCandles(pair, data, interval);
    }
}
