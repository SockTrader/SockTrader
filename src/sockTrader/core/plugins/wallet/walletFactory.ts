import config from "../../../../config";
import Wallet from "./wallet";

export default class WalletFactory {

    private static instance?: Wallet;

    static getInstance() {
        if (typeof this.instance === "undefined") {
            this.instance = new Wallet(config.assets);
        }

        return this.instance;
    }

}
