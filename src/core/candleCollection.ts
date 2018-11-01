import {CronJob, time} from "cron";
import parser from "cron-parser";
import {EventEmitter} from "events";
import {Moment} from "moment";
import moment = require("moment");
import logger from "./logger";

export interface ICandle {
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: Moment;
    volume: number;
}

export interface ICandleInterval {
    code: string;
    cron: string;
}

export interface IIntervalDict {
    [key: string]: ICandleInterval;
}

/**
 * Contains OHLCV history data for a trading pair.
 * The collection will automatically fill holes when initial and new data is pushed.
 * The collection can automatically generate values if no new values were pushed during a time interval.
 */
export default class CandleCollection extends EventEmitter {
    private candles: ICandle[] = [];

    public constructor(private interval: ICandleInterval, autoGenerateCandles: boolean = true, private retentionPeriod: number = 0) {
        super();

        if (autoGenerateCandles) {
            this.autoGenerateCandles(interval);
        }
    }

    public set(candles: ICandle[]): void {
        const interval = parser.parseExpression(this.interval.cron, {
            endDate: candles[0].timestamp.toDate(),
            currentDate: new Date(),
        });

        this.candles = this.fillCandleGaps(candles, interval).reverse();
        this.emit("update", this.candles);
    }

    public sort = (candles: ICandle[]): ICandle[] => candles.sort((a, b) => b.timestamp.diff(a.timestamp));

    /**
     * Update or insert newly received candles
     */
    public update(candles: ICandle[]): void {
        let needsSort = false;
        candles.forEach((updatedCandle) => {
            const candleUpdated = this.candles.some((candle, idx) => {
                if (candle.timestamp.isSame(updatedCandle.timestamp, "minute")) {
                    this.candles[idx] = updatedCandle;
                    return true;
                }
                return false;
            });

            if (!candleUpdated) {
                const l = this.candles.unshift(updatedCandle);

                // You need at least 2 candles to sort the list..
                if (l >= 2 && !this.candles[0].timestamp.isAfter(this.candles[1].timestamp, "minute")) {
                    logger.error(`Server has changed candle history! Suspected candle: ${JSON.stringify(updatedCandle)}`);
                    needsSort = true;
                }
            }
        });

        if (needsSort) {
            this.candles = this.sort(this.candles);
        }

        this.emit("update", this.candles);
    }

    /**
     * Generate new candles on each candle interval
     */
    private autoGenerateCandles(cronExpression: ICandleInterval): void {
        const cron = new CronJob(cronExpression.cron, () => {
            const last = moment(cron.lastDate()).second(0).millisecond(0);

            if (this.candles.length <= 0) {
                this.candles.unshift(this.getRecycledCandle({close: 0} as ICandle, last));
            } else if (last.isAfter(this.candles[0].timestamp, "minute")) {
                this.candles.unshift(this.getRecycledCandle(this.candles[0], last));
            }

            this.emit("update", this.candles);
        }, undefined, true, "Europe/Brussels");
    }

    private candleEqualsInterval(candle: ICandle, timestamp: Moment): boolean {
        return candle.timestamp.isSame(timestamp, "minute");
    }

    private equalsRetentionPeriod(candles: []): boolean {
        return candles.length === this.retentionPeriod;
    }

    /**
     * Fill gaps in candle list until now, based on a cron expression.
     */
    private fillCandleGaps(rawCandles: ICandle[], interval: any): ICandle[] {
        rawCandles = this.sort(rawCandles);

        const candles: ICandle[] = [];
        const generateCandle = this.getCandleGenerator(rawCandles);

        while (true) {
            const nextInterval: Moment = moment(interval.prev().toDate());
            const candle = generateCandle(nextInterval);

            candles.unshift(candle);

            if (this.equalsRetentionPeriod(candles as [])) {
                break;
            }

            if (this.candleEqualsInterval(rawCandles[rawCandles.length - 1], nextInterval)) {
                break;
            }
        }

        return candles;
    }

    /**
     * Returns a function which will either return a new candle or recycle a previous candle.
     */
    private getCandleGenerator(candles: ICandle[]): (interval: Moment) => ICandle {
        let position = 0;
        return (nextInterval) => {
            let candle = candles[position];

            if (!this.candleEqualsInterval(candle, nextInterval)) {
                candle = this.getRecycledCandle(candles[position], nextInterval);
            } else {
                position += 1;
            }

            return candle;
        };
    }

    /**
     * Copy candle based on the close value of a different candle
     */
    private getRecycledCandle = ({close}: ICandle, timestamp: Moment): ICandle => ({
        open: close,
        high: close,
        low: close,
        close,
        volume: 0,
        timestamp,
    });
}
