import logger from "../../../../sockTrader/core/logger";
import SpreadLogger from "../../../../sockTrader/core/plugins/logging/spreadLogger";
import Orderbook from "../../../../sockTrader/core/orderbook";
import {FX_ASK, FX_BID} from "../../../../__fixtures__/orderbook";

jest.mock("../../../../sockTrader/core/logger");

function createOrderbook() {
    const orderbook = new Orderbook(["BTC", "USD"]);
    orderbook.setOrders(FX_ASK, FX_BID, 1);

    return orderbook;
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("onUpdateOrderbook", () => {
    test("Should log orderbook spread", () => {
        const orderLogger = new SpreadLogger();
        orderLogger.onUpdateOrderbook(createOrderbook());

        expect(logger.info).toBeCalledWith("-0.0016945986336464561 BID: 0.074944 ASK: 0.074817");
    });

    test("Should not log if spread did not change", () => {
        const orderLogger = new SpreadLogger();
        orderLogger.onUpdateOrderbook(createOrderbook());
        orderLogger.onUpdateOrderbook(createOrderbook());

        expect(logger.info).toBeCalledTimes(1);
    });
});
