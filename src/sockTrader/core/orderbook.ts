import {Decimal} from "decimal.js-light";
import reverse from "lodash.reverse";
import sortBy from "lodash.sortby";
import {orderbookLogger} from "./logger";
import {Pair} from "./types/pair";

export enum Operator {
    PLUS = "+",
    MINUS = "-",
}

export enum OrderbookSide {
    BID = "bid",
    ASK = "ask",
}

export interface OrderbookEntry {
    price: number;
    size: number;
}

/**
 * The Orderbook contains all the market making orders on the remote exchange.
 */
export default class Orderbook {

    ask: OrderbookEntry[] = [];
    bid: OrderbookEntry[] = [];

    sequenceId = 0;

    constructor(protected pair: Pair, protected precision = 8) {
    }

    /**
     * Calculate bid/ask spread in %
     * @param {number} bid price bid
     * @param {number} ask price asked
     * @returns {number} percentage spread bid/ask
     */
    static getBidAskSpreadPerc(bid: number, ask: number): number {
        const increase: Decimal = new Decimal(ask).minus(bid);
        return increase.dividedBy(bid).toNumber();
    }

    /**
     * Add increment to internal order book properties
     * sort the orders by value
     * @param {OrderbookEntry[]} ask the price asked
     * @param {OrderbookEntry[]} bid the price bid
     * @param sequenceId
     */
    addIncrement(ask: OrderbookEntry[], bid: OrderbookEntry[], sequenceId: number): void {
        if (this.isValidSequence(sequenceId)) {
            this.sequenceId = sequenceId;
            this.ask = sortBy(this.applyIncrement(this.ask, ask), ["price"]);
            this.bid = reverse(sortBy(this.applyIncrement(this.bid, bid), ["price"]));
        }
    }

    /**
     * Calculate a price higher/lower then the given price
     * @param {number} price
     * @param {('+'|'-')} operator
     * @param {number} [ticks=1]
     * @returns {number}
     */
    getAdjustedPrice(price: number, operator: Operator, ticks = 1): number {
        const decPrice: Decimal = new Decimal(price);

        const func = (operator === Operator.PLUS)
            ? (a: Decimal, b: Decimal | number) => a.plus(b)
            : (a: Decimal, b: Decimal | number) => a.minus(b);

        const m: number = Math.pow(10, this.precision);
        const natNum: Decimal = decPrice.times(m);
        return func(natNum, ticks).dividedBy(m).toNumber();
    }

    /**
     * Scans the in memory orderBook for the first x entries
     * @param {('bid'|'ask')} side
     * @param {number} amount
     * @returns {OrderbookEntry[]}
     */
    getEntries(side: OrderbookSide, amount = 1): OrderbookEntry[] {
        return this[side].slice(0, Math.abs(amount));
    }

    /**
     * Returns absolute satoshi difference between num1 and num2
     * @param {string|number} num1
     * @param {string|number} num2
     * @returns {number}
     */
    getSatDiff(num1: number, num2: number): number {
        const multipl: number = Math.pow(10, this.precision);
        return Math.abs(new Decimal(num1).times(multipl).toNumber() - new Decimal(num2).times(multipl).toNumber());
    }

    /**
     * Validates if the given sequence id is higher than the previous one
     * @param sequenceId
     */
    private isValidSequence(sequenceId: number): boolean {
        if (sequenceId <= this.sequenceId) {
            orderbookLogger.info(`Sequence dropped: ${sequenceId}, last one: ${this.sequenceId}`);
            return false;
        }

        return true;
    }

    /**
     * Set all orders in order book
     * @param {OrderbookEntry[]} ask
     * @param {OrderbookEntry[]} bid
     * @param sequenceId
     */
    setOrders(ask: OrderbookEntry[], bid: OrderbookEntry[], sequenceId: number): void {
        if (this.isValidSequence(sequenceId)) {
            this.sequenceId = sequenceId;
            this.ask = sortBy(ask, ["price"]);
            this.bid = reverse(sortBy(bid, ["price"]));
        }
    }

    /**
     * Returns a new side of the orderBook with applied increment
     * @param {OrderbookEntry[]} oldBook
     * @param {OrderbookEntry[]} inc
     */
    private applyIncrement(oldBook: OrderbookEntry[], inc: OrderbookEntry[] = []): OrderbookEntry[] {
        let newBook: OrderbookEntry[] = oldBook.slice(0);

        inc.forEach(({price, size}) => {

            // Remove outdated records from copy of oldBook
            newBook = newBook.filter(v => v.price !== price);

            if (size > 0) {
                newBook.push({price, size}); // Add updated record to orderBook
            }
        });

        return newBook;
    }
}
