import Wallet from "../../plugins/wallet/wallet";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {ICandleProcessor} from "../../types/ICandleProcessor";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";
import OrderTracker from "../../order/orderTracker";
import LocalCandleProcessor from "./localCandleProcessor";
import RemoteCandleProcessor from "./remoteCandleProcessor";

export default class PaperTradingCandleProcessor implements ICandleProcessor {

    private localCandleProcessor: LocalCandleProcessor;
    private remoteCandleProcessor: RemoteCandleProcessor;

    constructor(readonly orderTracker: OrderTracker, readonly exchange: BaseExchange, readonly wallet: Wallet) {
        this.localCandleProcessor = new LocalCandleProcessor(orderTracker, exchange, wallet);
        this.remoteCandleProcessor = new RemoteCandleProcessor();
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
