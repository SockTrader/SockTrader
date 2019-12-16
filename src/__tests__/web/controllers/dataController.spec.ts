import {dataHandler, dataListHandler} from "../../../sockTrader/web/controllers/dataController";

jest.mock("fs");

const MOCK_FILES = ["bitstamp_btcusd_1h.json"];

beforeEach(() => require("fs").__setMockFiles(MOCK_FILES));

const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn();
    res.sendFile = jest.fn();
    return res;
};

describe("Send candle data of a normalized candle file", () => {
    it("Should return all data in a normalized candle file", async () => {
        const isFile = jest.fn(() => true);
        require("fs").__setStatMock({isFile});

        const res = mockResponse();
        const req = {query: {file: "Y29pbmJhc2VfYnRjdXNkXzFo"}};

        await dataHandler(req as any, res, null as any);

        expect(res.sendFile).toHaveBeenLastCalledWith(expect.stringContaining("coinbase_btcusd_1h.json"));
    });
});

describe("List all normalized candle files", () => {

    it("Should return list of all candle files in base64 encoded format", async () => {
        const res = mockResponse();

        await dataListHandler(null as any, res, null as any);

        expect(res.send).toBeCalledWith([{
            "id": "Yml0c3RhbXBfYnRjdXNkXzFo",
            "file": "bitstamp_btcusd_1h",
        }]);
    });
});
