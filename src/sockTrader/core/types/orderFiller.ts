import {Candle} from "./candle";
import {CandleInterval} from "./candleInterval";
import {Pair} from "./pair";

export interface OrderFiller {

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void;

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void;

}
