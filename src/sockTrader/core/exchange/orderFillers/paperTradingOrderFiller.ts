import OrderTracker from "../../order/orderTracker";
import {Candle} from "../../types/candle";
import {CandleInterval} from "../../types/candleInterval";
import {OrderFiller} from "../../types/orderFiller";
import {Pair} from "../../types/pair";
import Wallet from "../../wallet/wallet";
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
