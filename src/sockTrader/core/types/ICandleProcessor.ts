import {ICandle} from "./ICandle";
import {ICandleInterval} from "./ICandleInterval";
import {Pair} from "./pair";

export interface ICandleProcessor {

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

}
