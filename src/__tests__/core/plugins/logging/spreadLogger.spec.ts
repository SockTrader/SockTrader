import {orderbookLogger} from "../../../../sockTrader/core/loggerFactory";
import SpreadLogger from "../../../../sockTrader/core/plugins/logging/spreadLogger";
import Orderbook from "../../../../sockTrader/core/orderbook/orderbook";
import {FX_ASK, FX_BID} from "../../../../__fixtures__/orderbook";

jest.mock("../../../../sockTrader/core/loggerFactory");

function createOrderbook() {
    const orderbook = new Orderbook(["BTC", "USD"]);
    orderbook.setOrders(FX_ASK, FX_BID, 1);

    return orderbook;
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("onUpdateOrderbook", () => {
    it("Should log orderbook spread", () => {
        const orderLogger = new SpreadLogger();
        orderLogger.onUpdateOrderbook(createOrderbook());

        expect(orderbookLogger.info).toBeCalledWith({
            type: "Orderbook",
            spread: -0.0016945986336464561,
            bid: 0.074944,
            ask: 0.074817,
        });
    });

    it("Should not log if spread did not change", () => {
        const orderLogger = new SpreadLogger();
        orderLogger.onUpdateOrderbook(createOrderbook());
        orderLogger.onUpdateOrderbook(createOrderbook());

        expect(orderbookLogger.info).toBeCalledTimes(1);
    });
});
