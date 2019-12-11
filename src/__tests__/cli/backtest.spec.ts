import BackTest from "../../sockTrader/cli/backtest";
import {loadCandleFile, loadStrategy} from "../../sockTrader/cli/util";
import {FX_CANDLE_LIST} from "../../__fixtures__/candles";
import BackTester from "../../sockTrader/core/bot/backTester";
import WalletFactory from "../../sockTrader/core/plugins/wallet/walletFactory";
import IPCReporter from "../../sockTrader/core/plugins/IPCReporter";

jest.mock("../../sockTrader/cli/util");

beforeEach(() => {
    jest.clearAllMocks();
    (loadCandleFile as any).mockImplementation(() => ({default: {candles: FX_CANDLE_LIST, symbol: ["BTC", "USD"]}}));
    (loadStrategy as any).mockImplementation(() => ({default: jest.fn()}));
});

describe("startBacktest", () => {
    test("Should be able to start a backtesting process", async () => {
        const bt = new BackTest("coinbase_btcusd_1h", "simpleMovingAverage");
        const start = jest.fn();
        bt.createBackTester = () => ({start}) as any;

        await bt.start();

        expect(start).toBeCalledTimes(1);
        expect(process.env.SOCKTRADER_TRADING_MODE).toEqual("BACKTEST");
    });

    test("Should log exceptions to console output", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation();

        const bt = new BackTest("coinbase_btcusd_1h", "simpleMovingAverage");
        bt.createBackTester = () => {
            throw new Error("throw in unit test");
        };

        await bt.start();

        expect(spy).toBeCalledWith(new Error("throw in unit test"));
    });
});


describe("createBackTester", () => {
    test("Should create a configured BackTester instance", async () => {
        const bt = new BackTest("coinbase_btcusd_1h", "simpleMovingAverage");

        const {default: strategy} = await loadStrategy("");
        const {default: candleFile} = await loadCandleFile("");

        const instance = bt.createBackTester(candleFile, strategy);

        expect(instance).toBeInstanceOf(BackTester);
        expect(instance["inputCandles"]).toEqual(FX_CANDLE_LIST);
        expect(instance["strategyConfigurations"]).toEqual([
            expect.objectContaining({pair: ["BTC", "USD"]}),
        ]);
        expect(instance["plugins"]).toEqual(expect.arrayContaining([
            WalletFactory.getInstance(),
            new IPCReporter(),
        ]));
    });
});

