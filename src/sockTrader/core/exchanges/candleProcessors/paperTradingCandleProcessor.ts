import Wallet from "../../assets/wallet";
import {CandleProcessor} from "../../types/candleProcessor";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";
import OrderTracker from "../utils/orderTracker";
import LocalCandleProcessor from "./localCandleProcessor";
import RemoteCandleProcessor from "./remoteCandleProcessor";

export default class PaperTradingCandleProcessor implements CandleProcessor {

    private localCandleProcessor: LocalCandleProcessor;
    private remoteCandleProcessor: RemoteCandleProcessor;

    constructor(readonly orderTracker: OrderTracker, readonly exchange: BaseExchange, readonly wallet: Wallet) {
        this.localCandleProcessor = new LocalCandleProcessor(orderTracker, exchange, wallet);
        this.remoteCandleProcessor = new RemoteCandleProcessor(exchange);
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
