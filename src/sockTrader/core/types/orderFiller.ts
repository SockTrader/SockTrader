import {Candle} from "./Candle";
import {CandleInterval} from "./CandleInterval";
import {Pair} from "./pair";

export interface OrderFiller {

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void;

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void;

}
