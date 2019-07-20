import {Moment} from "moment";
import {ICandle} from "../types/ICandle";

export default class CandleCollection extends Array<ICandle> {

    constructor(...candles: ICandle[]) {
        super(...candles);
    }

    first(amount: number) {
        return this.slice(0, Math.abs(amount));
    }

    last(amount: number) {
        return this.slice(-Math.abs(amount));
    }

    /**
     * Get list of all candle close values
     */
    get close(): number[] {
        return this.map(value => value.close);
    }

    /**
     * Get list of all candle high values
     */
    get high(): number[] {
        return this.map(value => value.high);
    }

    /**
     * Get list of all candle low values
     */
    get low(): number[] {
        return this.map(value => value.low);
    }

    /**
     * Get list of all candle open values
     */
    get open(): number[] {
        return this.map(value => value.open);
    }

    /**
     * Get list of all candle timestamp values
     */
    get timestamp(): Moment[] {
        return this.map(value => value.timestamp);
    }

    /**
     * Get list of all candle volume values
     */
    get volume(): number[] {
        return this.map(value => value.volume);
    }
}
