import {Decimal} from "decimal.js-light";
import reverse from "lodash.reverse";
import sortBy from "lodash.sortby";

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
    addIncrement(ask: IOrderbookEntry[], bid: IOrderbookEntry[]): void;

    getEntries(side: OrderbookSide, amount: number): IOrderbookEntry[];

    setOrders(ask: IOrderbookEntry[], bid: IOrderbookEntry[]): void;
}

/**
 * @class OrderbookBase
 * @classdesc Order book to be used within an exchange class
 */
export default class Orderbook implements IOrderbook {

    ask: IOrderbookEntry[] = [];
    bid: IOrderbookEntry[] = [];

    constructor(protected pair: string, protected precision = 8) {
    }

    /**
     * Calculate bid/ask spread in %
     * @param {number} bid
     * @param {number} ask
     * @returns {number}
     */
    static getBidAskSpreadPerc(bid: number, ask: number): number {
        const increase: Decimal = new Decimal(ask).minus(bid);
        return increase.dividedBy(bid).toNumber();
    }

    /**
     * Add increment to internal order book properties
     * @param {IOrderbookEntry[]} ask
     * @param {IOrderbookEntry[]} bid
     */
    addIncrement(ask: IOrderbookEntry[], bid: IOrderbookEntry[]): void {
        this.ask = sortBy(this.applyIncrement(this.ask, ask), ["price"]);
        this.bid = reverse(sortBy(this.applyIncrement(this.bid, bid), ["price"]));
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
    getEntries(side: "bid" | "ask", amount = 1): IOrderbookEntry[] {
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
     * Immediately set all orders in order book
     * @param {IOrderbookEntry[]} ask
     * @param {IOrderbookEntry[]} bid
     */
    setOrders(ask: IOrderbookEntry[], bid: IOrderbookEntry[]): void {
        this.ask = sortBy(ask, ["price"]);
        this.bid = reverse(sortBy(bid, ["price"]));
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
