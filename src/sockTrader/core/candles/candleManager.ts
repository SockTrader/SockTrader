import {CronJob} from "cron";
import parser from "cron-parser";
import {EventEmitter} from "events";
import moment, {Moment} from "moment";
import config from "../../../config";
import logger from "../logger";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";

/**
 * Contains OHLCV history data for a trading pair.
 * The collection will automatically fill holes when initial and new data is pushed
 * The collection can automatically generate values if no new values were pushed during a time interval
 */
export default class CandleManager extends EventEmitter {
    private candles: ICandle[] = [];
    private readonly cronjob: CronJob;
    private readonly interval: ICandleInterval;
    private readonly retentionPeriod: number = 0;

    /**
     * Creates a new CandleManager
     * @param {ICandleInterval} interval the interval between the candles
     * @param {boolean} generateCandles if should generate candles when nothing is received
     * @param {number} retentionPeriod how long to keep candles
     */
    constructor(interval: ICandleInterval, generateCandles = true, retentionPeriod = 0) {
        super();
        this.retentionPeriod = retentionPeriod;
        this.interval = interval;

        const candleGenerator = this.generateCandles.bind(this);
        this.cronjob = new CronJob(interval.cron, candleGenerator, undefined, generateCandles, config.timezone);
    }

    /**
     * Immediately set/replace all candles in the collection
     */
    set(candles: ICandle[]): void {
        const interval = parser.parseExpression(this.interval.cron, {
            endDate: candles[0].timestamp.toDate(),
            currentDate: new Date(),
        });

        this.candles = this.fillCandleGaps(candles, interval).reverse();
        this.emit("update", this.candles);
    }

    sort(candles: ICandle[]): ICandle[] {
        return [...candles].sort((a, b) => b.timestamp.diff(a.timestamp));
    }

    /**
     * Stop automatic candle generator
     */
    stop() {
        this.cronjob.stop();
    }

    /**
     * Update or insert newly received candles
     * @param {ICandle[]} candles candles to add
     */
    update(candles: ICandle[]): void {
        let needsSort = false;
        candles.forEach(updatedCandle => {
            const isCandleReplaced = this.findAndReplaceCandle(updatedCandle);

            if (!isCandleReplaced) {
                this.candles.unshift(updatedCandle);
                this.removeRetentionOverflow(this.candles);

                if (!needsSort) needsSort = this.needsSort();
            }
        });

        if (needsSort) this.candles = this.sort(this.candles);

        this.emit("update", this.candles);
    }

    /**
     * We might need to re-sort the array in the rare occasion that we've inserted an older candle.
     * You never know what an exchange might return.
     */
    private needsSort() {
        let needsSort = false;
        if (this.candles.length >= 2 && !this.candles[0].timestamp.isAfter(this.candles[1].timestamp, "minute")) {
            logger.error(`Server has changed candle history! Suspected candle: ${JSON.stringify(this.candles[0])}`);
            needsSort = true;
        }

        return needsSort;
    }

    /**
     * Replace candle if it exists in the array
     * Returns true on a successful replacement
     * @param newCandle
     */
    private findAndReplaceCandle(newCandle: ICandle): boolean {
        return this.candles.some((candle, idx) => {
            if (this.candleEqualsTimestamp(candle, newCandle.timestamp)) {
                this.candles[idx] = newCandle;
                return true;
            }
            return false;
        });
    }

    /**
     * Validates if a candle equals a certain timestamp
     * @param {ICandle} candle the candle
     * @param {moment.Moment} timestamp the time
     * @returns {boolean} occurs on given time
     */
    private candleEqualsTimestamp(candle: ICandle, timestamp: Moment): boolean {
        return candle.timestamp.isSameOrAfter(timestamp, "minute");
    }

    /**
     * Fill gaps in candle list until now, based on a cron expression
     * @param {ICandle[]} candles candle collection to fill
     * @param interval interval for which to fill
     * @returns {ICandle[]} the filled collection
     */
    private fillCandleGaps(candles: ICandle[], interval: any): ICandle[] {
        candles = this.sort(candles);

        const result: ICandle[] = [];
        const generateCandle = this.getCandleGenerator(candles);

        while (true) {
            const nextInterval: Moment = moment(interval.prev().toDate());
            const candle = generateCandle(nextInterval);

            result.unshift(candle);

            if (result.length === this.retentionPeriod) break;

            if (this.candleEqualsTimestamp(candles[candles.length - 1], nextInterval)) break;
        }

        return result;
    }

    /**
     * Generate new candles on each candle interval
     */
    private generateCandles(): void {
        const last = moment(this.cronjob.lastDate()).second(0).millisecond(0);

        if (this.candles.length <= 0) {
            this.candles.unshift(this.getRecycledCandle({close: 0} as ICandle, last));
        } else if (last.isAfter(this.candles[0].timestamp, "minute")) {
            this.candles.unshift(this.getRecycledCandle(this.candles[0], last));
        }

        this.removeRetentionOverflow(this.candles);
        this.emit("update", this.candles);
    }

    /**
     * Returns a function which will either return a new candle or recycle a previous candle
     * This function should be executed on every timer tick so that even though no values
     * changed, the candle collection receives a 'new' candle
     * @param {ICandle[]} candles collection
     * @returns {(interval: moment.Moment) => ICandle} candle generator
     */
    private getCandleGenerator(candles: ICandle[]): (interval: Moment) => ICandle {
        let position = 0;
        return nextInterval => {
            let candle = candles[position];

            if (!this.candleEqualsTimestamp(candle, nextInterval)) {
                candle = this.getRecycledCandle(candles[position], nextInterval);
            } else {
                position += 1;
            }

            return candle;
        };
    }

    /**
     * Copy candle based on the close value of a different candle
     * for indicating an interval without price change
     * @param {number} close the close
     * @param {moment.Moment} timestamp the timestamp
     * @returns {ICandle} copied candle
     */
    private getRecycledCandle({close}: ICandle, timestamp: Moment): ICandle {
        return {
            open: close,
            high: close,
            low: close,
            close,
            volume: 0,
            timestamp,
        };
    }

    /**
     * Removes candles outside the retention period
     * @param {ICandle[]} candles the candle collection
     */
    private removeRetentionOverflow(candles: ICandle[]): void {
        if (this.retentionPeriod > 0 && candles.length > this.retentionPeriod) {
            candles.splice(this.retentionPeriod - candles.length);
        }
    }
}
