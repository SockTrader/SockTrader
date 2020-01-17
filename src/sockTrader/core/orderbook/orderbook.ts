import reverse from "lodash.reverse";
import sortBy from "lodash.sortby";
import {orderbookLogger} from "../loggerFactory";
import {Pair} from "../types/pair";

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

    private readonly sequenceThreshold = 1000;

    ask: OrderbookEntry[] = [];
    bid: OrderbookEntry[] = [];

    sequenceId = 0;

    constructor(protected pair: Pair) {
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
     * Scans the in memory orderBook for the first x entries
     * @param {('bid'|'ask')} side
     * @param {number} amount
     * @returns {OrderbookEntry[]}
     */
    getEntries(side: OrderbookSide, amount = 1): OrderbookEntry[] {
        return this[side].slice(0, Math.abs(amount));
    }

    /**
     * Validates if the given sequence id is higher than the previous one
     * @param sequenceId
     */
    private isValidSequence(sequenceId: number): boolean {
        if (sequenceId > this.sequenceId) return true;

        if (Math.abs(this.sequenceId - sequenceId) > this.sequenceThreshold) {
            orderbookLogger.info(`Possible sequence reset? Prev: ${this.sequenceId}, current: ${sequenceId}`);
            return true;
        }

        orderbookLogger.info(`Sequence dropped: ${sequenceId}, last one: ${this.sequenceId}`);
        return false;
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
