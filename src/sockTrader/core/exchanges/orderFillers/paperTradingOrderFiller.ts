import OrderTracker from "../../order/orderTracker";
import Wallet from "../../plugins/wallet/wallet";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IOrderFiller} from "../../types/IOrderFiller";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";
import LocalOrderFiller from "./localOrderFiller";
import RemoteOrderFiller from "./remoteOrderFiller";

export default class PaperTradingOrderFiller implements IOrderFiller {

    private localCandleProcessor: LocalOrderFiller;
    private remoteCandleProcessor: RemoteOrderFiller;

    constructor(readonly orderTracker: OrderTracker, readonly exchange: BaseExchange, readonly wallet: Wallet) {
        this.localCandleProcessor = new LocalOrderFiller(orderTracker, exchange, wallet);
        this.remoteCandleProcessor = new RemoteOrderFiller();
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.localCandleProcessor.onSnapshotCandles(pair, data, interval);
        this.remoteCandleProcessor.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.localCandleProcessor.onUpdateCandles(pair, data, interval);
        this.remoteCandleProcessor.onUpdateCandles(pair, data, interval);
    }
}
