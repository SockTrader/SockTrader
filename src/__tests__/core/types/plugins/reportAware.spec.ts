import OrderLogger from "../../../../sockTrader/core/plugins/logging/orderLogger";
import {isReportAware} from "../../../../sockTrader/core/types/plugins/reportAware";

describe("isReportAware", () => {
    it("Should return true when called with a class that implements ReportAware", () => {
        expect(isReportAware(new OrderLogger())).toEqual(true);
    });

    it("Should return false when called with something else", () => {
        expect(isReportAware(false as any)).toEqual(false);
    });
});
