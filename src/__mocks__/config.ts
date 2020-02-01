import OrderLogger from "../sockTrader/core/plugins/logging/orderLogger";
import WalletLogger from "../sockTrader/core/plugins/logging/walletLogger";
import ProfitCalculator from "../sockTrader/core/plugins/order/profitCalculator";

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
        new ProfitCalculator(),
        new WalletLogger(),
        new OrderLogger(),
    ],
};
