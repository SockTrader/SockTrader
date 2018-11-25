/* tslint:disable */
import {describe, it} from "mocha";
import {crossDown, crossUp} from "./utils";
import {expect} from "chai";

describe("Strategy utilities", () => {

    it("Should find a positive crossover", () => {
        expect(crossUp([10, 5, 0], [5, 5, 5])).to.eq(true);
        expect(crossUp([10, 5, 5, 5, 0], [5, 5, 5, 5, 5])).to.eq(true);

        expect(crossUp([10, 5, 5], [5, 5, 5])).to.eq(false);
        expect(crossUp([10, 5, 5, 10], [5, 5, 5, 5])).to.eq(false);

        expect(crossUp([0, 5, 0], [5, 5, 5])).to.eq(false);
        expect(crossUp([0, 5, 5, 5, 0], [5, 5, 5, 5, 5])).to.eq(false);
    });

    it("Should find a negative crossover", () => {
        expect(crossDown([0, 5, 10], [5, 5, 5])).to.eq(true);
        expect(crossDown([0, 5, 5, 5, 10], [5, 5, 5, 5, 5])).to.eq(true);

        expect(crossDown([0, 5, 5], [5, 5, 5])).to.eq(false);
        expect(crossDown([10, 5, 5, 10], [5, 5, 5, 5])).to.eq(false);

        expect(crossDown([0, 5, 0], [5, 5, 5])).to.eq(false);
        expect(crossDown([0, 5, 5, 5, 0], [5, 5, 5, 5, 5])).to.eq(false);
    });
});
