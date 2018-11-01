/* tslint:disable */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import sinon from 'sinon';

import CandleCollection, {ICandle} from "../src/core/candleCollection";
import moment = require("moment");

const start = moment().seconds(0).millisecond(0).subtract(7, "minutes");

describe('CandleCollection', () => {

    it('Should sort all candles, with the latest candle first and the last candle last', () => {
        const collection = new CandleCollection({code: 'M1', cron: "00 */1 * * * *"}, false);
        const candles = collection.sort([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "day")},
        ]);

        expect(candles).to.deep.equal([
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "day")},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
        ]);
    });

    it('Should fill all candle gaps until last interval occurrence before current time', () => {
        const collection = new CandleCollection({code: 'M1', cron: "00 */1 * * * *"}, false);
        collection.on("update", (candles: ICandle[]) => {
            const testCandles = candles.map(c => ({...c, timestamp: c.timestamp.toISOString()}));
            expect(testCandles).to.deep.equal([
                {
                    open: 3,
                    high: 3,
                    low: 3,
                    close: 3,
                    volume: 0,
                    timestamp: start.clone().add(7, "minutes").toISOString()
                },
                {
                    open: 3,
                    high: 3,
                    low: 3,
                    close: 3,
                    volume: 0,
                    timestamp: start.clone().add(6, "minutes").toISOString()
                },
                {
                    open: 2,
                    high: 4,
                    low: 2,
                    close: 3,
                    volume: 10,
                    timestamp: start.clone().add(5, "minutes").toISOString()
                },
                {
                    open: 2,
                    high: 2,
                    low: 2,
                    close: 2,
                    volume: 0,
                    timestamp: start.clone().add(4, "minutes").toISOString()
                },
                {
                    open: 2,
                    high: 2,
                    low: 2,
                    close: 2,
                    volume: 0,
                    timestamp: start.clone().add(3, "minutes").toISOString()
                },
                {
                    open: 2,
                    high: 2,
                    low: 2,
                    close: 2,
                    volume: 0,
                    timestamp: start.clone().add(2, "minutes").toISOString()
                },
                {
                    open: 1.5,
                    high: 3,
                    low: 1,
                    close: 2,
                    volume: 5,
                    timestamp: start.clone().add(1, "minutes").toISOString()
                },
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone().toISOString()},
            ]);
        });

        collection.set([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "minutes")},
        ]);
    });

    it('Should fill all candle gaps until retention period is met', () => {
        const collection = new CandleCollection({code: 'M1', cron: "00 */1 * * * *"}, false, 3);
        collection.on("update", (candles: ICandle[]) => {
            const testCandles = candles.map(c => ({...c, timestamp: c.timestamp.toISOString()}));
            expect(testCandles).to.deep.equal([
                {
                    open: 3,
                    high: 3,
                    low: 3,
                    close: 3,
                    volume: 0,
                    timestamp: start.clone().add(7, "minutes").toISOString()
                },
                {
                    open: 3,
                    high: 3,
                    low: 3,
                    close: 3,
                    volume: 0,
                    timestamp: start.clone().add(6, "minutes").toISOString()
                },
                {
                    open: 2,
                    high: 4,
                    low: 2,
                    close: 3,
                    volume: 10,
                    timestamp: start.clone().add(5, "minutes").toISOString()
                },
            ]);
        });

        collection.set([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "minutes")},
        ]);
    });

    it('Should automatically generate new candles', () => {
        const start = moment().seconds(0).millisecond(0);
        const clock = sinon.useFakeTimers(new Date());
        const results = [];

        const collection = new CandleCollection({code: 'M1', cron: "00 */1 * * * *"}, true);
        collection.on("update", (candles: ICandle[]) => {
            const testCandles = candles.map(c => ({...c, timestamp: c.timestamp.toISOString()}));
            results.push(testCandles);
        });

        collection.set([{open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()}]);

        clock.tick('01:00');
        collection.stop();

        const testResults = [
            [
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone().toISOString()}
            ],
            [
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: start.clone().add(1, "minute").toISOString()},
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone().toISOString()}
            ]
        ];

        expect(results).to.deep.equal(testResults);
    });

});