import TradeProfitCalculator from "../../../sockTrader/core/plugins/tradeProfitCalculator";
import {IOrder, OrderSide, OrderStatus} from "../../../sockTrader/core/types/order";

let calculator = new TradeProfitCalculator();

beforeEach(() => {
    calculator = new TradeProfitCalculator();
})

describe("TradeProfitCalculator", () => {
    test("Should log profit/loss compared to average buy price", async () => {
        calculator.onReport({side:OrderSide.BUY, price: 50, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.BUY, price: 150, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.SELL, price: 200, quantity: 3, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.SELL, price: 400, quantity: 2, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.BUY, price: 300, quantity: 5, status: OrderStatus.FILLED} as IOrder);
        calculator.onReport({side:OrderSide.SELL, price: 100, quantity: 5, status: OrderStatus.FILLED} as IOrder);
    });

});
