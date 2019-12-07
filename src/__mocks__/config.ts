import OrderLogger from "../sockTrader/core/plugins/logging/orderLogger";
import WalletLogger from "../sockTrader/core/plugins/logging/walletLogger";
import TradeProfitCalculator from "../sockTrader/core/plugins/tradeProfitCalculator";

module.exports = {
    timezone: "Europe/Brussels",

    webServer: {
        port: 3000,
    },

    assets: {
        USD: 100000,
    },

    exchanges: {
        hitbtc: {
            publicKey: "pub_key",
            secretKey: "sec_key",
        },
    },

    plugins: [
        new TradeProfitCalculator(),
        new WalletLogger(),
        new OrderLogger(),
    ],
};
