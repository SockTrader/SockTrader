import logger from "../../../../sockTrader/core/logger";
import OrderLogger from "../../../../sockTrader/core/plugins/logging/orderLogger";
import {FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";

jest.mock("../../../../sockTrader/core/logger");

describe("onReport", () => {
    it("Should log order reports", () => {
        const orderLogger = new OrderLogger();
        orderLogger.onReport(FX_NEW_BUY_ORDER);

        expect(logger.info).toBeCalledWith("Order: {\"side\":\"buy\",\"quantity\":1,\"price\":100,\"status\":\"new\"}");
    });
});
