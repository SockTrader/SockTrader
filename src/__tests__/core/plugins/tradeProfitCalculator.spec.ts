import TradeProfitCalculator from "../../../sockTrader/core/plugins/tradeProfitCalculator";
import {IOrder, OrderSide, OrderStatus} from "../../../sockTrader/core/types/order";
import {walletLogger} from "../../../sockTrader/core/logger";

jest.mock("../../../sockTrader/core/logger");

let calculator = new TradeProfitCalculator();

beforeEach(() => {
    jest.clearAllMocks();
    calculator = new TradeProfitCalculator();
})

describe("TradeProfitCalculator", () => {

    test("Should not log when selling too much assets", async () => {
        calculator.onReport({side:OrderSide.SELL, price: 50, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toBeCalledTimes(0);
    });

    test("Should not log when status is not FILLED or PARTIALLY_FILLED", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 50, quantity: 5, status: OrderStatus.NEW} as IOrder);
        expect(walletLogger.info).toBeCalledTimes(0);
    });

    test("Should log when status is FILLED", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 50, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toBeCalledTimes(1);
        expect(walletLogger.info).toBeCalledWith("Avg buy: 50");
    });

    test("Should log when status is PARTIALLY_FILLED", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 100, quantity: 5, status: OrderStatus.PARTIALLY_FILLED} as IOrder);
        expect(walletLogger.info).toBeCalledTimes(1);
        expect(walletLogger.info).toBeCalledWith("Avg buy: 100");
    });

    test("Should log profit/loss compared to average buy price", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 50, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.BUY, price: 150, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toHaveBeenNthCalledWith(1,"Avg buy: 50");
        expect(walletLogger.info).toHaveBeenNthCalledWith(2, "Avg buy: 100");

        calculator.onReport({side:OrderSide.SELL, price: 200, quantity: 3, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.SELL, price: 400, quantity: 2, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toHaveBeenNthCalledWith(3,"Profit: 100 1");
        expect(walletLogger.info).toHaveBeenNthCalledWith(4, "Profit: 300 3");

        calculator.onReport({side:OrderSide.BUY, price: 300, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toHaveBeenNthCalledWith(5,"Avg buy: 200");

        calculator.onReport({side:OrderSide.SELL, price: 100, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        expect(walletLogger.info).toHaveBeenNthCalledWith(6, "Profit: -100 -0.5");
    });

});
