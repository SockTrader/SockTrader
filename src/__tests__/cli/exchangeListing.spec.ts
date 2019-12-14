import {listExchanges} from "../../sockTrader/cli/exchangeListing";

describe("listExchanges", () => {
    it("Should all available exchanges", () => {
        const spyLog = jest.spyOn(console, "log").mockImplementation();
        const spyTable = jest.spyOn(console, "table").mockImplementation();

        listExchanges();

        expect(spyLog).toBeCalledWith("\x1b[4m\x1b[36m%s\x1b[0m", "hitbtc");
        expect(spyTable).toBeCalledWith({
            "15m": {cron: "00 */15 * * * *"},
            "1M": {cron: "00 00 00 00 */1 *"},
            "1d": {cron: "00 00 00 */1 * *"},
            "1h": {cron: "00 00 */1 * * *"},
            "1m": {cron: "00 */1 * * * *"},
            "30m": {cron: "00 */30 * * * *"},
            "3m": {cron: "00 */3 * * * *"},
            "4h": {cron: "00 00 2,6,10,14,18,22 * * *"},
            "5m": {cron: "00 */5 * * * *"},
            "7d": {cron: "00 00 00 */7 * *"},
        });
    });
});


