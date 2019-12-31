import crypto from "crypto";
import nanoid from "nanoid";
import config from "../../../config";
import WsConnection, {Data} from "../connection/wsConnection";
import Events from "../events";
import logger from "../logger";
import Orderbook from "../orderbook/orderbook";
import OrderbookFactory from "../orderbook/orderbookFactory";
import {CandleInterval} from "../types/candleInterval";
import {OrderbookData} from "../types/orderbookData";
import {Pair} from "../types/pair";
import {ResponseAdapter} from "../types/responseAdapter";
import BaseExchange from "./baseExchange";
import HitBTCCommand from "./commands/hitBTCCommand";
import HitBTCAdapter from "./hitBTCAdapter";

export const HitBTCCandleInterval: Record<string, CandleInterval> = {
    ONE_MINUTE: {code: "M1", cron: "00 */1 * * * *"},
    THREE_MINUTES: {code: "M3", cron: "00 */3 * * * *"},
    FIVE_MINUTES: {code: "M5", cron: "00 */5 * * * *"},
    FIFTEEN_MINUTES: {code: "M15", cron: "00 */15 * * * *"},
    THIRTY_MINUTES: {code: "M30", cron: "00 */30 * * * *"},
    ONE_HOUR: {code: "H1", cron: "00 00 */1 * * *"},
    FOUR_HOURS: {code: "H4", cron: "00 00 2,6,10,14,18,22 * * *"},
    ONE_DAY: {code: "D1", cron: "00 00 00 */1 * *"},
    SEVEN_DAYS: {code: "D7", cron: "00 00 00 */7 * *"},
    ONE_MONTH: {code: "1M", cron: "00 00 00 00 */1 *"},
};

/**
 * The HitBTC class represent the HitBTC exchange
 * @see https://hitbtc.com/
 */
export default class HitBTC extends BaseExchange {
    readonly adapter: ResponseAdapter = new HitBTCAdapter(this);
    private publicKey: string = config.exchanges.hitbtc.publicKey;
    private secretKey: string = config.exchanges.hitbtc.secretKey;

    protected createConnection(): WsConnection {
        return new WsConnection("wss://api.hitbtc.com/api/2/ws", 40000);
    }

    loadCurrencies(): void {
        this.connection.send(new HitBTCCommand("getSymbols"));
    }

    /**
     * Authenticates user on exchange using secure signed nonce
     * @param publicKey the public key
     * @param privateKey the private key
     */
    login(publicKey: string, privateKey: string): void {
        const nonce: string = nanoid(32);
        const signature: string = crypto.createHmac("sha256", privateKey).update(nonce).digest("hex");

        this.connection.send(HitBTCCommand.createRestorable("login", {
            algo: "HS256",
            nonce,
            pKey: publicKey,
            signature,
        }));
    }

    onSnapshotOrderbook({pair, ask, bid, sequence}: OrderbookData) {
        const orderbook: Orderbook = OrderbookFactory.getInstance(pair);
        orderbook.setOrders(ask, bid, sequence);

        Events.emit("core.snapshotOrderbook", orderbook);
    }

    onUpdateOrderbook({pair, ask, bid, sequence}: OrderbookData) {
        const orderbook: Orderbook = OrderbookFactory.getInstance(pair);
        orderbook.addIncrement(ask, bid, sequence);

        Events.emit("core.updateOrderbook", orderbook);
    }

    subscribeCandles(pair: Pair, interval: CandleInterval): void {
        const command = HitBTCCommand.createRestorable("subscribeCandles", {
            symbol: pair.join(""),
            period: interval.code,
        });

        return this.connection.send(command);
    }

    subscribeOrderbook = (pair: Pair): void => {
        const command = HitBTCCommand.createRestorable("subscribeOrderbook", {symbol: pair.join("")});
        this.connection.send(command);
    };

    subscribeReports = (): void => {
        const command = HitBTCCommand.createRestorable("subscribeReports");
        this.connection.send(command);
    };

    protected onConnect(): void {
        super.onConnect();

        this.connection.on("message", (data: Data) => this.adapter.onReceive(data));
        this.loadCurrencies();

        if (this.publicKey !== "" && this.secretKey !== "") {
            logger.info("Live credentials are used!");
            this.login(this.publicKey, this.secretKey);
        }
    }
}
