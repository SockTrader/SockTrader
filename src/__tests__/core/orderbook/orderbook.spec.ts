import Orderbook, {OrderbookSide} from "../../../sockTrader/core/orderbook/orderbook";
import {FX_ASK, FX_BID} from "../../../__fixtures__/orderbook";

let ob = new Orderbook(["BTC", "USD"]);
beforeEach(() => {
    ob = new Orderbook(["BTC", "USD"]);
    ob.setOrders(FX_ASK, FX_BID, 1);
});

describe("addIncrement", () => {
    it("Should update the orderbook when an increment is added", () => {
        const spy = jest.spyOn(ob, "applyIncrement" as any);
        ob.addIncrement([
            {"price": 0.074834, "size": 100},
            {"price": 0.074835, "size": 200},
            {"price": 0.074817, "size": 0},
            {"price": 0.074819, "size": 150},
        ], [
            {"price": 0.074944, "size": 100},
            {"price": 0.074925, "size": 150},
            {"price": 0.074940, "size": 0},
            {"price": 0.074941, "size": 10},
        ], 2);

        expect(spy).toBeCalledTimes(2);
        expect(ob.ask).toStrictEqual([
            {"price": 0.074819, "size": 150},
            {"price": 0.074834, "size": 100},
            {"price": 0.074835, "size": 200},
        ]);
        expect(ob.bid).toStrictEqual([
            {"price": 0.074944, "size": 100},
            {"price": 0.074941, "size": 10},
            {"price": 0.074925, "size": 150},
        ]);
    });
});

describe("getEntries", () => {
    it("Should return a subset of the orderbook", () => {
        const ask = ob.getEntries(OrderbookSide.ASK, 1);
        const bid = ob.getEntries(OrderbookSide.BID, 1);
        expect(ask).toStrictEqual([{"price": 0.074817, "size": 100}]);
        expect(bid).toStrictEqual([{"price": 0.074944, "size": 2000}]);
    });
});

it("Should set sorted orders in orderbook", () => {
    expect(ob.ask).toStrictEqual([
        {"price": 0.074817, "size": 100},
        {"price": 0.074819, "size": 100},
        {"price": 0.074834, "size": 2500},
    ]);
    expect(ob.bid).toStrictEqual([
        {"price": 0.074944, "size": 2000},
        {"price": 0.074940, "size": 451},
        {"price": 0.074925, "size": 100},
    ]);
});
