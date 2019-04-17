import "jest";
import {crossDown, crossUp, validateRecursive} from "../../sockTrader/core/strategy/utils";

/**
 * NOTE THAT ARRAY VALUES ARE REVERSED! THIS IS THE EXPECTED BEHAVIOUR.
 * REASON: Easier access to historical array values.
 */

describe("crossUp with reversed array values", () => {
    test.each([
        [[10, 5, 0], [5, 5, 5]],
        [[10, 5, 5, 5, 0], [5, 5, 5, 5, 5]],
    ])('Should return TRUE if line A breaks upwards through line B', (lineA, lineB) => {
        expect(crossUp(lineA, lineB)).toEqual(true);
    });

    test.each([
        [[], []],
        [[10], [5]],
        [[undefined, 5, 0], [5, 5, undefined]],
    ])('Should return FALSE if line A or B is invalid', (lineA, lineB) => {
        expect(crossUp(lineA, lineB)).toEqual(false);
    });

    test.each([
        [[10, 5, 5], [5, 5, 5]],
        [[10, 5, 5, 10], [5, 5, 5, 5]],
        [[0, 5, 0], [5, 5, 5]],
        [[0, 5, 5, 5, 0], [5, 5, 5, 5, 5]],
    ])('Should return FALSE if line A doesn\'t fully break through line B', (lineA, lineB) => {
        expect(crossUp(lineA, lineB)).toEqual(false);
    });
});

describe("crossDown with reversed array values", () => {
    test.each([
        [[0, 5, 10], [5, 5, 5]],
        [[0, 5, 5, 5, 10], [5, 5, 5, 5, 5]],
    ])('Should return TRUE if line A breaks downwards through line B', (lineA, lineB) => {
        expect(crossDown(lineA, lineB)).toEqual(true);
    });

    test.each([
        [[], []],
        [[10], [5]],
        [[undefined, 5, 10], [5, 5, undefined]],
    ])('Should return FALSE if line A or B is invalid', (lineA, lineB) => {
        expect(crossUp(lineA, lineB)).toEqual(false);
    });

    test.each([
        [[10, 5, 5, 10], [5, 5, 5, 5]],
        [[0, 5, 5], [5, 5, 5]],
        [[0, 5, 0], [5, 5, 5]],
        [[0, 5, 5, 5, 0], [5, 5, 5, 5, 5]],
    ])('Should return FALSE if line A doesn\'t fully break through line B', (lineA, lineB) => {
        expect(crossDown(lineA, lineB)).toEqual(false);
    });
});

describe("Validate recursively", () => {
   test("Recursiveness", () => {
       const validator = jest.fn((a, b) => a > 0 && b > 0);
       const validate = validateRecursive(validator);

       // expect(validator).toBeCalledTimes(10);
       expect(validate([1, 1, 1, 1, 1], [1, 1, 1, 1, 1])).toEqual(true);
   });
});