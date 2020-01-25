import {Moment} from "moment";
import {Candle} from "../types/candle";

export default class CandleCollection {

    constructor(private candles: Candle[]) {
    }

    getFirst(amount = 1) {
        return this.candles.slice(0, Math.abs(amount));
    }

    getLast(amount = 1) {
        return this.candles.slice(-Math.abs(amount));
    }

    getAll() {
        return this.candles;
    }

    /**
     * Get first candle
     */
    get first(): Candle {
        return this.candles[0];
    }

    /**
     * Get last candle
     */
    get last(): Candle {
        return this.candles[this.candles.length - 1];
    }

    /**
     * Get list of all candle close values
     */
    get close(): number[] {
        return this.candles.map(value => value.close);
    }

    /**
     * Get list of all candle high values
     */
    get high(): number[] {
        return this.candles.map(value => value.high);
    }

    /**
     * Get list of all candle low values
     */
    get low(): number[] {
        return this.candles.map(value => value.low);
    }

    /**
     * Get list of all candle open values
     */
    get open(): number[] {
        return this.candles.map(value => value.open);
    }

    /**
     * Get list of all candle timestamp values
     */
    get timestamp(): Moment[] {
        return this.candles.map(value => value.timestamp);
    }

    /**
     * Get list of all candle volume values
     */
    get volume(): number[] {
        return this.candles.map(value => value.volume);
    }
}
