import {orderLogger} from "../../../../sockTrader/core/loggerFactory";
import OrderLogger from "../../../../sockTrader/core/plugins/logging/orderLogger";
import {FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";

jest.mock("../../../../sockTrader/core/loggerFactory");

describe("onReport", () => {
    it("Should log order reports", () => {
        const ol = new OrderLogger();
        ol.onReport(FX_NEW_BUY_ORDER);

        expect(orderLogger.info).toBeCalledWith({
            type: "Order",
            payload: expect.objectContaining({
                id: "NEW_BUY_ORDER_1",
                pair: ["BTC", "USD"],
                price: 100,
                quantity: 1,
                reportType: "new",
                side: "buy",
                status: "new",
                timeInForce: "GTC",
                type: "limit",
            }),
        });
    });
});
