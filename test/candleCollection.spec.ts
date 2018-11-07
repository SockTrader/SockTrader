/* tslint:disable */
import {expect} from 'chai';
import {describe, it} from 'mocha';
import sinon from 'sinon';

import CandleCollection, {ICandle} from "../src/core/candleCollection";
import moment, {Moment} from 'moment';

const start = moment().seconds(0).millisecond(0).subtract(7, "minutes");
const getTimestamp = (start: Moment, minutes = 0): string => start.clone().add(minutes, 'minutes').toISOString();

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
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTimestamp(start, 7)},
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTimestamp(start, 6)},
                {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: getTimestamp(start, 5)},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTimestamp(start, 4)},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTimestamp(start, 3)},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTimestamp(start, 2)},
                {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: getTimestamp(start, 1)},
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTimestamp(start)},
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
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTimestamp(start, 7)},
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTimestamp(start, 6)},
                {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: getTimestamp(start, 5)},
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

        // Generate new empty candle
        clock.tick('01:00');

        // Overwrite previous candles by using "set"
        collection.set([{open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone().add(1, 'minutes')}]);

        // Generate a new candle based on the previous one
        clock.tick('01:00');

        collection.stop();
        expect(results).to.deep.equal([
            [
                {open: 0, high: 0, low: 0, close: 0, volume: 0, timestamp: getTimestamp(start, 1)}
            ],
            [
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTimestamp(start, 1)},
            ],
            [
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTimestamp(start, 2)},
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTimestamp(start, 1)},
            ]
        ]);
    });

});