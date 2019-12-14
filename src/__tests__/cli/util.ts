import path from "path";
import {loadStrategy} from "../../sockTrader/cli/util";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("loadStrategy", () => {
    it("Should load a strategy file", async () => {
        const spy = jest.spyOn(path, "resolve");

        await loadStrategy("simpleMovingAverage");

        expect(spy).toBeCalledWith(expect.stringContaining("src"), "./../../strategies", "simpleMovingAverage");
    });

    it("Should throw if called with invalid strategy", async () => {
        return loadStrategy("doesNotExist")
            .catch((e: any) => {
                expect(e.toString()).toEqual(expect.stringContaining("Cannot find module"));
            });
    });
});
