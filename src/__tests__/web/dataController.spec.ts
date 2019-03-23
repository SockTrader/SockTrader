/* tslint:disable */
import "jest";
import {dataListHandler} from "../../sockTrader/web/controllers/data";

jest.mock("fs");

const MOCK_FILES = ["bitstamp_btcusd_1h.json"];

beforeEach(() => {
    require("fs").__setMockFiles(MOCK_FILES);
});

afterEach(() => {
});

const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("strategy listing", () => {
    test("Should return list of all strategy files in base64 encoded format", async () => {
        const res = mockResponse();
        await dataListHandler(null, res, null);

        expect(res.send).toBeCalledWith([{
            "id": "Yml0c3RhbXBfYnRjdXNkXzFo",
            "file": "bitstamp_btcusd_1h",
        }]);
    });
});
