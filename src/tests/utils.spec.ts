/* tslint:disable */
import "jest";
import {crossDown, crossUp} from "../core/strategy/utils";

describe("crossUp", () => {
    test("Should find a positive crossover", () => {
        expect(crossUp([10, 5, 0], [5, 5, 5])).toEqual(true);
        expect(crossUp([10, 5, 5, 5, 0], [5, 5, 5, 5, 5])).toEqual(true);

        expect(crossUp([undefined, 5, 0], [5, 5, undefined])).toEqual(false);

        expect(crossUp([10, 5, 5], [5, 5, 5])).toEqual(false);
        expect(crossUp([10, 5, 5, 10], [5, 5, 5, 5])).toEqual(false);

        expect(crossUp([0, 5, 0], [5, 5, 5])).toEqual(false);
        expect(crossUp([0, 5, 5, 5, 0], [5, 5, 5, 5, 5])).toEqual(false);
    });
});

describe("crossDown", () => {
    test("Should find a negative crossover", () => {
        expect(crossDown([0, 5, 10], [5, 5, 5])).toEqual(true);
        expect(crossDown([0, 5, 5, 5, 10], [5, 5, 5, 5, 5])).toEqual(true);
    });

    test("Should not find a negative crossover if price only touches from above and bounces back", () => {
        expect(crossDown([10, 5, 5, 10], [5, 5, 5, 5])).toEqual(false);
    });

    test("Should not find a negative crossover if price only touches from below and bounces back", () => {
        expect(crossDown([0, 5, 5], [5, 5, 5])).toEqual(false);
    });

    test("Should not find a negative crossover if price only touches from below and bounces back", () => {
        expect(crossDown([0, 5, 0], [5, 5, 5])).toEqual(false);
    });

    test("Should not find a negative crossover if price only touches from below and bounces back", () => {
        expect(crossDown([0, 5, 5, 5, 0], [5, 5, 5, 5, 5])).toEqual(false);
    });

    test("Should not find a negative crossover when insufficient values are provided", () => {
        expect(crossDown([undefined, 5, 10], [5, 5, undefined])).toEqual(false);
    });
});