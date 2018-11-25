type Validator = (a: number, b: number) => boolean;

const recurValidator = (validator: Validator) => {
    const recursiveCheck = (a: number[], b: number[], depth = 0): boolean => {
        if (a[depth] === b[depth]) {
            return (a.length < depth + 2 || b.length < depth + 2)
                ? false
                : recursiveCheck(a, b, depth + 1);
        }

        return validator(a[depth], b[depth]);
    };
    return recursiveCheck;
};

/**
 * Validates a positive crossover of listA and listB
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
 */
export function crossUp(listA: number[], listB: number[]): boolean {
    const validate = recurValidator(((a, b) => a < b));

    return ((listA.length < 2 || listB.length < 2) || (listA[0] <= listB[0]))
        ? false
        : validate(listA, listB, 1);
}

/**
 * Validates a negative crossover of listA and listB
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
 */
export function crossDown(listA: number[], listB: number[]): boolean {
    const validate = recurValidator(((a, b) => a > b));

    return ((listA.length < 2 || listB.length < 2) || (listA[0] >= listB[0]))
        ? false
        : validate(listA, listB, 1);
}
