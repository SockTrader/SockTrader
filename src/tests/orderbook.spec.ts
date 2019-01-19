/* tslint:disable */
import {expect} from "chai";
import {spy} from 'sinon';
import 'jest';
import Orderbook, {Operator} from "../core/orderbook";
import {Pair} from "../core/types/pair";

const pair: Pair = ["BTC", "ETH"];
describe('Orderbook', () => {
    let ob = new Orderbook(pair, 8);
    beforeEach(() => {
        ob = new Orderbook(pair, 8);
        ob.setOrders([
            {price: 0.074819, size: 100},
            {price: 0.074817, size: 100},
            {price: 0.074834, size: 2500},
        ], [
            {price: 0.074940, size: 451},
            {price: 0.074944, size: 2000},
            {price: 0.074925, size: 100},
        ]);
    });

    it("calculate the adjusted price", () => {
        expect(ob.getAdjustedPrice(2, Operator.MINUS, 1)).to.be.equal(1.99999999);
        expect(ob.getAdjustedPrice(2, Operator.MINUS, 0.1)).to.be.equal(1.999999999);
        expect(ob.getAdjustedPrice(0.1, Operator.MINUS, 1)).to.be.equal(0.09999999);

        expect(ob.getAdjustedPrice(0.001263, Operator.MINUS, 1)).to.be.equal(0.00126299);
        expect(ob.getAdjustedPrice(0.001263, Operator.MINUS, 2)).to.be.equal(0.00126298);
        expect(ob.getAdjustedPrice(0.001263, Operator.MINUS, 3)).to.be.equal(0.00126297);

        expect(ob.getAdjustedPrice(0.001263, Operator.MINUS, 0.1)).to.be.equal(0.001262999);
    });

    it("calculate bid and ask spread", () => {
        expect(Orderbook.getBidAskSpreadPerc(1, 2)).to.be.equal(1);
        expect(Orderbook.getBidAskSpreadPerc(0.5, 2)).to.be.equal(3);
        expect(Orderbook.getBidAskSpreadPerc(0.001391, 0.001500)).to.be.equal(0.07836089144500359);
    });

    it("calculate satoshi difference between two numbers", () => {
        expect(ob.getSatDiff(1, 2)).to.be.equal(100000000);
        expect(ob.getSatDiff(0.1, 0.2)).to.be.equal(10000000);
        expect(ob.getSatDiff(0.1, 0.25)).to.be.equal(15000000);
        expect(ob.getSatDiff(0.25, 0.1)).to.be.equal(15000000);

        expect(ob.getSatDiff(0.001263, 0.001265)).to.be.equal(200);
        expect(ob.getSatDiff(0.001265, 0.001263)).to.be.equal(200);

        expect(ob.getSatDiff(0.001265, 0.00127)).to.be.equal(500);
        expect(ob.getSatDiff(0.00127, 0.001265)).to.be.equal(500);
    });

    it("Should set sorted orders in orderbook", () => {
        expect(ob.ask).to.deep.equal([
            {"price": 0.074817, "size": 100},
            {"price": 0.074819, "size": 100},
            {"price": 0.074834, "size": 2500},
        ]);
        expect(ob.bid).to.deep.equal([
            {"price": 0.074944, "size": 2000},
            {"price": 0.074940, "size": 451},
            {"price": 0.074925, "size": 100},
        ]);
    });

    it("Should return a subset of the orderbook", () => {
        const ask = ob.getEntries("ask", 1);
        const bid = ob.getEntries("bid", 1);
        expect(ask).to.deep.equal([{"price": 0.074817, "size": 100}]);
        expect(bid).to.deep.equal([{"price": 0.074944, "size": 2000}]);
    });

    it("Should be updatable with an increment", () => {
        const applyIncrement = spy(ob, "applyIncrement" as any);
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
        ]);

        expect(applyIncrement.calledTwice).to.eq(true);
        expect(ob.ask).to.deep.equal([
            {"price": 0.074819, "size": 150},
            {"price": 0.074834, "size": 100},
            {"price": 0.074835, "size": 200},
        ]);
        expect(ob.bid).to.deep.equal([
            {"price": 0.074944, "size": 100},
            {"price": 0.074941, "size": 10},
            {"price": 0.074925, "size": 150},
        ]);
    });
});
