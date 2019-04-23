/**
 * Calculates the number of decimals for a given number
 * @param {number} n the number
 * @param separator
 * @returns {number} number of decimals
 */
export function getDecimals(n: number, separator = "."): number {
    if (Math.floor(n) === n) return 0;
    return n.toString().split(separator)[1].length || 0;
}
