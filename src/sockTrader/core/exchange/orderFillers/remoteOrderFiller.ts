import CandleManager from "../../candle/candleManager";
import Events from "../../events";
import {Candle} from "../../types/candle";
import {CandleInterval} from "../../types/candleInterval";
import {OrderFiller} from "../../types/orderFiller";
import {Pair} from "../../types/pair";

export default class RemoteOrderFiller implements OrderFiller {

    private candles: Record<string, CandleManager> = {};

    /**
     * Returns candle manager for pair and interval
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {CandleInterval} interval time interval
     * @param {(candles: CandleManager) => void} updateHandler what to do if candle collection updates
     * @returns {CandleManager} the candle collection
     */
    getCandleManager(pair: Pair, interval: CandleInterval, updateHandler: (candles: CandleManager) => void): CandleManager {
        const key = `${pair}_${interval.code}`;
        if (this.candles[key]) {
            return this.candles[key];
        }

        this.candles[key] = new CandleManager(interval);
        this.candles[key].on("update", updateHandler);
        return this.candles[key];
    }

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.getCandleManager(pair, interval, candles => Events.emit("core.updateCandles", candles, pair))
            .set(data);
    }

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.getCandleManager(pair, interval, candles => Events.emit("core.updateCandles", candles, pair))
            .update(data);
    }
}
