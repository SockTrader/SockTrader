import {Decimal} from "decimal.js-light";
import reverse from "lodash.reverse";
import sortBy from "lodash.sortby";
import logger from "./logger";
import {Pair} from "./types/pair";

export enum Operator {
    PLUS = "+",
    MINUS = "-",
}

export enum OrderbookSide {
    BID = "bid",
    ASK = "ask",
}

export interface IOrderbookEntry {
    price: number;
    size: number;
}

export interface IOrderbook {
    addIncrement(ask: IOrderbookEntry[], bid: IOrderbookEntry[], sequenceId: number): void;

    getEntries(side: OrderbookSide, amount: number): IOrderbookEntry[];

    setOrders(ask: IOrderbookEntry[], bid: IOrderbookEntry[], sequenceId: number): void;
}

/**
 * The Orderbook contains all the market making orders on the remote exchange.
 */
export default class Orderbook implements IOrderbook {

    ask: IOrderbookEntry[] = [];
    bid: IOrderbookEntry[] = [];

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
     * @param {IOrderbookEntry[]} ask the price asked
     * @param {IOrderbookEntry[]} bid the price bid
     * @param sequenceId
     */
    addIncrement(ask: IOrderbookEntry[], bid: IOrderbookEntry[], sequenceId: number): void {
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
     * @returns {IOrderbookEntry[]}
     */
    getEntries(side: OrderbookSide, amount = 1): IOrderbookEntry[] {
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
            logger.info(`Sequence dropped: ${sequenceId}, last one: ${this.sequenceId}`);
            return false;
        }

        return true;
    }

    /**
     * Set all orders in order book
     * @param {IOrderbookEntry[]} ask
     * @param {IOrderbookEntry[]} bid
     * @param sequenceId
     */
    setOrders(ask: IOrderbookEntry[], bid: IOrderbookEntry[], sequenceId: number): void {
        if (this.isValidSequence(sequenceId)) {
            this.sequenceId = sequenceId;
            this.ask = sortBy(ask, ["price"]);
            this.bid = reverse(sortBy(bid, ["price"]));
        }
    }

    /**
     * Returns a new side of the orderBook with applied increment
     * @param {IOrderbookEntry[]} oldBook
     * @param {IOrderbookEntry[]} inc
     */
    private applyIncrement(oldBook: IOrderbookEntry[], inc: IOrderbookEntry[] = []): IOrderbookEntry[] {
        let newBook: IOrderbookEntry[] = oldBook.slice(0);

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
