import {normalize} from "../../sockTrader/cli/normalize";
import {normalizeDataFolder} from "../../sockTrader/data/normalizer";

jest.mock("../../sockTrader/data/normalizer");
jest.mock("ora");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("normalize", () => {
    it("Should show a waiting spinner", async () => {
        const ora = require('ora');

        await normalize();

        expect(ora).toBeCalledWith("Normalizing data");
        expect(ora.__start).toBeCalledTimes(1);
        expect(ora.__succeed).toBeCalledWith("Normalization finished!");
    });

    it("Should call data folder normalizer", async () => {
        await normalize();
        expect(normalizeDataFolder).toBeCalledTimes(1);
    });

    it("Should log error if something goes wrong", async () => {
        const ora = require('ora');
        const spy = jest.spyOn(console, "error").mockImplementation();
        (normalizeDataFolder as any).mockImplementation(() => {throw new Error("Unknown file")})

        await normalize();

        expect(ora.__fail).toBeCalledWith("Normalization failed. Please try again or submit a bug report");
        expect(spy).toBeCalledWith(new Error("Unknown file"));
    });
});

