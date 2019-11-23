import CandleManager from "../../candles/candleManager";
import Events from "../../events";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IOrderFiller} from "../../types/IOrderFiller";
import {Pair} from "../../types/pair";

export default class RemoteOrderFiller implements IOrderFiller {

    private candles: Record<string, CandleManager> = {};

    /**
     * Returns candle manager for pair and interval
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {ICandleInterval} interval time interval
     * @param {(candles: CandleManager) => void} updateHandler what to do if candle collection updates
     * @returns {CandleManager} the candle collection
     */
    getCandleManager(pair: Pair, interval: ICandleInterval, updateHandler: (candles: CandleManager) => void): CandleManager {
        const key = `${pair}_${interval.code}`;
        if (this.candles[key]) {
            return this.candles[key];
        }

        this.candles[key] = new CandleManager(interval);
        this.candles[key].on("update", updateHandler);
        return this.candles[key];
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.getCandleManager(pair, interval, candles => Events.emit("core.updateCandles", candles))
            .set(data);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.getCandleManager(pair, interval, candles => Events.emit("core.updateCandles", candles))
            .update(data);
    }
}
