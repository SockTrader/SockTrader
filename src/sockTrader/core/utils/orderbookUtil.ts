import {Decimal} from "decimal.js-light";

export enum Operator {
    PLUS = "+",
    MINUS = "-",
}

export default class OrderbookUtil {

    constructor(private precision = 8) {
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
     * Returns absolute satoshi difference between num1 and num2
     * @param {string|number} num1
     * @param {string|number} num2
     * @returns {number}
     */
    getSatDiff(num1: number, num2: number): number {
        const multipl: number = Math.pow(10, this.precision);
        return Math.abs(new Decimal(num1).times(multipl).toNumber() - new Decimal(num2).times(multipl).toNumber());
    }
}
