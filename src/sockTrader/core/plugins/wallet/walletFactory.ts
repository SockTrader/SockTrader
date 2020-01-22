import config from "../../../../config";
import Wallet from "./wallet";

export default class WalletFactory {

    private static instance?: Wallet;

    static getInstance() {
        if (typeof this.instance === "undefined") {
            // @TODO use assets from exchange if live trading
            this.instance = new Wallet(config.assets);
        }

        return this.instance;
    }

}
