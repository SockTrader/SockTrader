import OrderbookUtil, {Operator} from "../../../sockTrader/core/utils/orderbookUtil";

let util: OrderbookUtil;
beforeEach(() => {
    util = new OrderbookUtil(8);
});

describe("getBidAskSpreadPerc", () => {
    it("Should calculate the spread between bid and ask", () => {
        expect(OrderbookUtil.getBidAskSpreadPerc(1, 2)).toEqual(1);
        expect(OrderbookUtil.getBidAskSpreadPerc(0.5, 2)).toEqual(3);
        expect(OrderbookUtil.getBidAskSpreadPerc(0.001391, 0.001500)).toEqual(0.07836089144500359);
    });
});

describe("getAdjustedPrice", () => {
    it("Should return an adjusted price based on the amount of ticks", () => {
        expect(util.getAdjustedPrice(2, Operator.MINUS, 1)).toEqual(1.99999999);
        expect(util.getAdjustedPrice(2, Operator.MINUS, 0.1)).toEqual(1.999999999);
        expect(util.getAdjustedPrice(0.1, Operator.MINUS, 1)).toEqual(0.09999999);

        expect(util.getAdjustedPrice(0.001263, Operator.MINUS, 1)).toEqual(0.00126299);
        expect(util.getAdjustedPrice(0.001263, Operator.MINUS, 2)).toEqual(0.00126298);
        expect(util.getAdjustedPrice(0.001263, Operator.MINUS, 3)).toEqual(0.00126297);

        expect(util.getAdjustedPrice(0.001263, Operator.MINUS, 0.1)).toEqual(0.001262999);
    });
});

describe("getSatDiff", () => {
    it("Should return the difference between two numbers based on the precision", () => {
        expect(util.getSatDiff(1, 2)).toEqual(100000000);
        expect(util.getSatDiff(0.1, 0.2)).toEqual(10000000);
        expect(util.getSatDiff(0.1, 0.25)).toEqual(15000000);
        expect(util.getSatDiff(0.25, 0.1)).toEqual(15000000);

        expect(util.getSatDiff(0.001263, 0.001265)).toEqual(200);
        expect(util.getSatDiff(0.001265, 0.001263)).toEqual(200);

        expect(util.getSatDiff(0.001265, 0.00127)).toEqual(500);
        expect(util.getSatDiff(0.00127, 0.001265)).toEqual(500);
    });
});
