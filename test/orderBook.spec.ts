/* tslint:disable */
import {expect} from "chai";
import {describe, it} from 'mocha';
import Orderbook, {Operator} from "../src/core/orderbook";


describe('Orderbook', () => {

    it("calculate the adjusted price", () => {
        const ob1 = new Orderbook("COVETH", 8);
        expect(ob1.getAdjustedPrice(2, Operator.MINUS, 1)).to.be.equal(1.99999999);
        expect(ob1.getAdjustedPrice(2, Operator.MINUS, 0.1)).to.be.equal(1.999999999);
        expect(ob1.getAdjustedPrice(0.1, Operator.MINUS, 1)).to.be.equal(0.09999999);

        expect(ob1.getAdjustedPrice(0.001263, Operator.MINUS, 1)).to.be.equal(0.00126299);
        expect(ob1.getAdjustedPrice(0.001263, Operator.MINUS, 2)).to.be.equal(0.00126298);
        expect(ob1.getAdjustedPrice(0.001263, Operator.MINUS, 3)).to.be.equal(0.00126297);

        expect(ob1.getAdjustedPrice(0.001263, Operator.MINUS, 0.1)).to.be.equal(0.001262999);

        const ob2 = new Orderbook("COVETH", 6);
        expect(ob2.getAdjustedPrice(2, Operator.MINUS, 1)).to.be.equal(1.999999);
        expect(ob2.getAdjustedPrice(2, Operator.MINUS, 0.1)).to.be.equal(1.9999999);
        expect(ob2.getAdjustedPrice(0.1, Operator.MINUS, 1)).to.be.equal(0.099999);

        expect(ob2.getAdjustedPrice(0.001263, Operator.MINUS, 1)).to.be.equal(0.001262);
        expect(ob2.getAdjustedPrice(0.001263, Operator.MINUS, 2)).to.be.equal(0.001261);
        expect(ob2.getAdjustedPrice(0.001263, Operator.MINUS, 3)).to.be.equal(0.001260);

        expect(ob2.getAdjustedPrice(0.001263, Operator.MINUS, 0.1)).to.be.equal(0.0012629);
    });

    it("calculate bid and ask spread", () => {
        expect(Orderbook.getBidAskSpreadPerc(1, 2)).to.be.equal(1);
        expect(Orderbook.getBidAskSpreadPerc(0.5, 2)).to.be.equal(3);
        expect(Orderbook.getBidAskSpreadPerc(0.001391, 0.001500)).to.be.equal(0.07836089144500359);
    });

    it("calculate satoshi difference between two numbers", () => {
        const ob1 = new Orderbook("COVETH", 8);
        expect(ob1.getSatDiff(1, 2)).to.be.equal(100000000);
        expect(ob1.getSatDiff(0.1, 0.2)).to.be.equal(10000000);
        expect(ob1.getSatDiff(0.1, 0.25)).to.be.equal(15000000);
        expect(ob1.getSatDiff(0.25, 0.1)).to.be.equal(15000000);

        expect(ob1.getSatDiff(0.001263, 0.001265)).to.be.equal(200);
        expect(ob1.getSatDiff(0.001265, 0.001263)).to.be.equal(200);

        expect(ob1.getSatDiff(0.001265, 0.00127)).to.be.equal(500);
        expect(ob1.getSatDiff(0.00127, 0.001265)).to.be.equal(500);

        const ob2 = new Orderbook("COVETH", 6);
        expect(ob2.getSatDiff(1, 2)).to.be.equal(1000000);
        expect(ob2.getSatDiff(0.1, 0.2)).to.be.equal(100000);
        expect(ob2.getSatDiff(0.1, 0.25)).to.be.equal(150000);
        expect(ob2.getSatDiff(0.25, 0.1)).to.be.equal(150000);

        expect(ob2.getSatDiff(0.025, 0.01)).to.be.equal(15000);
        expect(ob2.getSatDiff(0.00127, 0.001265)).to.be.equal(5);
    });
});
