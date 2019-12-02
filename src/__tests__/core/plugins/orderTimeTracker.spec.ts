import {Order, OrderStatus, ReportType} from "../../../sockTrader/core/types/order";
import {walletLogger} from "../../../sockTrader/core/logger";
import OrderTimeTracker from "../../../sockTrader/core/plugins/orderTimeTracker";

jest.mock("../../../sockTrader/core/logger");

let timeTracker = new OrderTimeTracker();

beforeEach(() => {
    jest.clearAllMocks();
    timeTracker = new OrderTimeTracker();
});

describe("TradeProfitCalculator", () => {

    beforeEach(() => {
        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000);
    });

    test("Should not log when new order has been created", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.NEW} as Order);
        expect(walletLogger.info).toHaveBeenCalledTimes(0);
    });

    test("Should log when an order has been filled", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.FILLED} as Order);
        expect(walletLogger.info).toHaveBeenNthCalledWith(1, "Open time: 0 filled");
    });

    test("Should log when an order has been partially filled", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.PARTIALLY_FILLED} as Order);
        expect(walletLogger.info).toHaveBeenNthCalledWith(1, "Open time: 0 partiallyFilled");
    });

    test("Should log when an order has been filled", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.NEW} as Order);
        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000 + (60 * 5) * 1000);

        timeTracker.onReport({id: "1", status: OrderStatus.FILLED} as Order);
        expect(walletLogger.info).toHaveBeenNthCalledWith(1, "Open time: 300 filled");
    });

    test.each([
        [OrderStatus.EXPIRED],
        [OrderStatus.SUSPENDED],
        [OrderStatus.CANCELED],
        [OrderStatus.FILLED],
    ])("Should cleanup completed orders", (status: OrderStatus) => {
        timeTracker.onReport({id: "1", status: OrderStatus.NEW} as Order);
        expect(timeTracker["orders"]).toEqual({"1": 1479427200});

        timeTracker.onReport({id: "1", status: status} as Order);
        expect(timeTracker["orders"]).toEqual({});
    });

    test("Should move replaced orders to new ID", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.NEW} as Order);
        expect(timeTracker["orders"]).toEqual({"1": 1479427200});

        timeTracker.onReport({id: "2", originalId: "1", reportType: ReportType.REPLACED} as Order);
        expect(timeTracker["orders"]).toEqual({"2": 1479427200});
    });

    test("Should log time of correct order when multiple orders are placed", () => {
        timeTracker.onReport({id: "1", status: OrderStatus.NEW} as Order);

        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000 + (60 * 5) * 1000);
        timeTracker.onReport({id: "2", status: OrderStatus.NEW} as Order);

        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000 + (60 * 10) * 1000);
        timeTracker.onReport({id: "1", status: OrderStatus.FILLED} as Order);
        expect(walletLogger.info).toHaveBeenNthCalledWith(1, "Open time: 600 filled");

        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000 + (60 * 20) * 1000);
        timeTracker.onReport({id: "2", status: OrderStatus.FILLED} as Order);
        expect(walletLogger.info).toHaveBeenNthCalledWith(2, "Open time: 900 filled");
    });
});
