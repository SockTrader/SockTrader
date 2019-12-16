import {getBaseFilenames, loadFiles} from "../../sockTrader/cli/util";
import {listCandles, listStrategies} from "../../sockTrader/cli/directoryListing";

jest.mock("../../sockTrader/cli/util");

beforeEach(() => {
    jest.clearAllMocks();
    (getBaseFilenames as any).mockImplementation((files: any) => files);
});

describe("listStrategies", () => {
    it("Should all available strategy files", async () => {
        (loadFiles as any).mockImplementation(() => (["simpleMovingAverage"]));
        const spy = jest.spyOn(console, "table").mockImplementation();

        await listStrategies();

        expect(loadFiles).toBeCalledWith(expect.stringContaining("/strategies"));
        expect(spy).toBeCalledWith(["simpleMovingAverage"]);
    });
});

describe("listCandles", () => {
    it("Should all available candle data files", async () => {
        (loadFiles as any).mockImplementation(() => (["coinbase_btcusd_1h"]));
        const spy = jest.spyOn(console, "table").mockImplementation();

        await listCandles();

        expect(loadFiles).toBeCalledWith(expect.stringContaining("/data"));
        expect(spy).toBeCalledWith(["coinbase_btcusd_1h"]);
    });
});

