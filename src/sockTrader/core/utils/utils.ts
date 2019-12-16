import {lowercase, numbers, uppercase} from "nanoid-dictionary";
import generate from "nanoid/generate";
import {Pair} from "../types/pair";

/**
 * Generates orderId based on trading pair, timestamp, increment and random string. With max length 32 characters
 * ex: 15COVETH1531299734778DkXBry9y-sQ
 * @param pair crypto pair (BTC USD/BTC ETH)
 * @returns {string} order id
 */
export function generateOrderId(pair: Pair): string {
    const alphabet = `${lowercase}${uppercase}${numbers}_-.|`;
    const orderId = `${pair}${new Date().getTime()}`;

    return orderId + generate(alphabet, 32 - orderId.length);
}
