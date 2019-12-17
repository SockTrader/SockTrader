import {loadStrategy} from "../../sockTrader/cli/util";
import LiveTrading from "../../sockTrader/cli/liveTrading";
import WalletFactory from "../../sockTrader/core/plugins/wallet/walletFactory";
import LiveTrader from "../../sockTrader/core/bot/liveTrader";
import ExchangeFactory from "../../sockTrader/core/exchanges/exchangeFactory";
import hitBTC from "../../sockTrader/core/exchanges/hitBTC";

jest.mock("inquirer");
jest.mock("../../sockTrader/cli/util");

const tradingConfig = {
    paper: true,
    force: true,
    exchange: "hitbtc",
    pair: ["BTC", "USD"],
    interval: "1m",
    strategy: "simpleMovingAverage",
};

function createLiveTradingInstance(config: any) {
    (loadStrategy as any).mockImplementation(() => ({default: jest.fn()}));
    return new LiveTrading(config);
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("constructor", () => {
    it("Should store all configuration properties as instance properties", () => {
        const instance = createLiveTradingInstance(tradingConfig);
        expect(instance["paper"]).toEqual(true);
        expect(instance["force"]).toEqual(true);
        expect(instance["exchange"]).toEqual("hitbtc");
        expect(instance["pair"]).toEqual(["BTC", "USD"]);
        expect(instance["interval"]).toEqual("1m");
        expect(instance["strategy"]).toEqual("simpleMovingAverage");
    });
});

describe("askForConfirmation", () => {
    const start = jest.fn();
    const spyConsole = jest.spyOn(console, "log").mockImplementation();
    let inquirer = require("inquirer");
    let lt: any;

    beforeEach(() => {
        lt = createLiveTradingInstance({...tradingConfig, paper: false, force: false});
        lt.createLiveTrader = () => ({start}) as any;
    });

    it("Should continue if confirmation has been accepted", async () => {
        inquirer.__setPrompt(true);

        await lt.start();

        expect(start).toBeCalledTimes(1);
    });

    it("Should stop if confirmation has been denied", async () => {
        inquirer.__setPrompt(false);

        await lt.start();

        expect(start).toBeCalledTimes(0);
        expect(spyConsole).toBeCalledWith("We just saved you a few bucks. No harm is done, thank me later ;-)");
    });

    it("Should ask user if he knows what he's doing", async () => {
        inquirer.__setPrompt(true);
        const spy = jest.spyOn(inquirer, "prompt");

        await lt.start();

        expect(spy).toBeCalledWith([{
            message: "Know that SockTrader cannot be held responsible for any losses. Are you sure you want to continue?",
            name: "confirmation",
            type: "confirm",
        }]);
    });
});

describe("createLiveTrader", () => {
    it("Should create a configured LiveTrader instance", async () => {
        const lt = createLiveTradingInstance(tradingConfig);
        const exchange = new ExchangeFactory().createExchange("hitbtc");
        const instance = lt.createLiveTrader(exchange, jest.fn(), ["BTC", "USD"]);

        expect(instance).toBeInstanceOf(LiveTrader);
        expect(instance["plugins"]).toEqual(expect.arrayContaining([WalletFactory.getInstance()]));
        expect(instance["exchange"]).toBeInstanceOf(hitBTC);
        expect(instance["strategyConfig"]).toEqual(expect.objectContaining({pair: ["BTC", "USD"]}));
    });
});

describe("start", () => {
    it.each([
        [false, false, 1],
        [true, false, 0],
        [false, true, 0],
    ])("Should only ask for confirmation when live trading", async (paper, force, calls) => {
        const lt = createLiveTradingInstance({...tradingConfig, paper, force});
        lt.createLiveTrader = () => ({start: jest.fn()}) as any;
        lt.askForConfirmation = jest.fn();

        await lt.start();

        expect(lt.askForConfirmation).toBeCalledTimes(calls as number);
    });

    it("Should log if something goes wrong", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation();
        const lt = createLiveTradingInstance(tradingConfig);
        lt.createLiveTrader = () => {
            throw new Error("Unexpected error");
        };

        await lt.start();

        expect(spy).toBeCalledWith(new Error("Unexpected error"));
    });
});

