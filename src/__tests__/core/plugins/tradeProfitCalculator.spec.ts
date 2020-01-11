import TradeProfitCalculator from "../../../sockTrader/core/plugins/tradeProfitCalculator";
import {Order, OrderSide, OrderStatus} from "../../../sockTrader/core/types/order";
import {orderLogger} from "../../../sockTrader/core/logger";
import {FX_FILLED_BUY_ORDER, FX_FILLED_SELL_ORDER, FX_NEW_BUY_ORDER} from "../../../__fixtures__/order";

jest.mock("../../../sockTrader/core/logger");

let calculator = new TradeProfitCalculator();

beforeEach(() => {
    jest.clearAllMocks();
    calculator = new TradeProfitCalculator();
})

describe("onReport", () => {

    it("Should not log when selling too much assets", async () => {
        calculator.onReport(FX_FILLED_SELL_ORDER);
        expect(orderLogger.info).toBeCalledTimes(0);
    });

    it("Should not log when status is not FILLED or PARTIALLY_FILLED", async () => {
        calculator.onReport(FX_NEW_BUY_ORDER);
        expect(orderLogger.info).toBeCalledTimes(0);
    });

    it("Should log when status is FILLED", async () => {
        calculator.onReport(FX_FILLED_BUY_ORDER);
        expect(orderLogger.info).toBeCalledTimes(1);
        expect(orderLogger.info).toBeCalledWith({type: "Avg buy", payload: 100});
    });

    it("Should log when status is PARTIALLY_FILLED", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 100, quantity: 5, status: OrderStatus.PARTIALLY_FILLED} as Order);
        expect(orderLogger.info).toBeCalledTimes(1);
        expect(orderLogger.info).toBeCalledWith({type: "Avg buy", payload: 100});
    });

    it("Should log profit/loss compared to average buy price", async () => {
        calculator.onReport({...FX_FILLED_BUY_ORDER, price: 50, quantity: 5});
        calculator.onReport({...FX_FILLED_BUY_ORDER, price: 150, quantity: 5});
        expect(orderLogger.info).toHaveBeenNthCalledWith(1,{type: "Avg buy", payload: 50});
        expect(orderLogger.info).toHaveBeenNthCalledWith(2, {type: "Avg buy", payload: 100});

        calculator.onReport({...FX_FILLED_SELL_ORDER, price: 200, quantity: 3});
        calculator.onReport({...FX_FILLED_SELL_ORDER, price: 400, quantity: 2});
        expect(orderLogger.info).toHaveBeenNthCalledWith(3,{type: "Profit", abs: 100, perc: 1});
        expect(orderLogger.info).toHaveBeenNthCalledWith(4, {type: "Profit", abs: 300, perc: 3});

        calculator.onReport({...FX_FILLED_BUY_ORDER, price: 300, quantity: 5});
        expect(orderLogger.info).toHaveBeenNthCalledWith(5,{type: "Avg buy", payload: 200});

        calculator.onReport({...FX_FILLED_SELL_ORDER, price: 100, quantity: 5});
        expect(orderLogger.info).toHaveBeenNthCalledWith(6, {type: "Profit", abs: -100, perc: -0.5});
    });

});
