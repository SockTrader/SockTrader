import {remember} from "../../../../sockTrader/core/utils/strategy/remember";

describe("remember", () => {
    it("Should remember values for a certain period", () => {
        const gen = remember(3);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
    });

    it("Should endlessly remember values if period is 0", () => {
        const gen = remember(0);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
        expect(gen.next(false).value).toEqual(true);
    });

    it("Should remember values for 1 period", () => {
        const gen = remember(1);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(true).value).toEqual(true);
        expect(gen.next(false).value).toEqual(false);
        expect(gen.next(false).value).toEqual(false);
    });
});
