type Validator = (a: number, b: number) => boolean;

export const validateRecursive = (validator: Validator) => {
    const validate = (a: number[], b: number[], depth = 0): boolean => {
        if (a[depth] === b[depth]) {
            return (a.length < depth + 2 || b.length < depth + 2)
                ? false
                : validate(a, b, depth + 1);
        }

        return validator(a[depth], b[depth]);
    };

    return validate;
};

/**
 * Validates a positive crossover of lineA and lineB
 *
 * VALID SCENARIOS:
 *       o             o
 *     /             /
 * ---o-------o--o--o----
 *  /       /
 * o       o
 *
 * INVALID SCENARIOS:
 *                o          o
 *                 \       /
 * ----o--o--o------o--o--o----
 *   /        \
 *  o          o
 *
 * @param {number[]} lineA line to check if it crosses over
 * @param {number[]} lineB line to check if is goes under
 * @returns {boolean} lineA crosses over lineB
 */
export function crossUp(lineA: number[], lineB: number[]): boolean {
    const validate = validateRecursive(((a, b) => a < b));

    return ((lineA.length < 2 || lineB.length < 2) || (lineA[0] <= lineB[0]))
        ? false
        : validate(lineA, lineB, 1);
}

/**
 * Validates a negative crossover of lineA and lineB
 *
 * VALID SCENARIOS:
 *  o       o
 *   \       \
 * ---o-------o--o--o----
 *     \             \
 *      o             o
 *
 * INVALID SCENARIOS:
 *                o          o
 *                 \       /
 * ----o--o--o------o--o--o----
 *   /        \
 *  o          o
 *
 * @param {number[]} lineA line to check if is goes under
 * @param {number[]} lineB line to check if it crosses over
 * @returns {boolean} lineA goes under lineB
 */
export function crossDown(lineA: number[], lineB: number[]): boolean {
    const validate = validateRecursive(((a, b) => a > b));

    return ((lineA.length < 2 || lineB.length < 2) || (lineA[0] >= lineB[0]))
        ? false
        : validate(lineA, lineB, 1);
}

/**
 * Calculates the number of decimals for a given number
 * @param {number} n the number
 * @returns {number} number of decimals
 */
export function decimals(n: number, seperator: string){
    const d: string = String(n);
    return d.indexOf(seperator) > -1 ? d.substr(d.indexOf(seperator) + 1).length : 0;
}
