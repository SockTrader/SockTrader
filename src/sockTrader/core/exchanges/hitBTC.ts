import crypto from "crypto";
import nanoid from "nanoid";
import config from "../../../config";
import WebSocket, {Data} from "../connection/webSocket";
import logger from "../logger";
import Orderbook from "../orderbook";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {IOrderbookData} from "../types/IOrderbookData";
import {IResponseAdapter} from "../types/IResponseAdapter";
import {IOrder, OrderSide} from "../types/order";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import {paperTrade} from "./decorators/paperTrade";
import HitBTCAdapter from "./hitBTCAdapter";
import {generateOrderId} from "./utils/utils";
import HitBTCCommand from "./commands/hitBTCCommand";

export const CandleInterval: Record<string, ICandleInterval> = {
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
@paperTrade
export default class HitBTC extends BaseExchange {
    readonly adapter: IResponseAdapter = new HitBTCAdapter(this);

    protected createConnection(): IConnection {
        return new WebSocket("wss://api.hitbtc.com/api/2/ws", 40 * 1000);
    }

    adjustOrder(order: IOrder, price: number, qty: number): void {
        if (this.orderManager.canAdjustOrder(order, price, qty)) {
            const newOrderId = generateOrderId(order.pair);

            this.send(new HitBTCCommand("cancelReplaceOrder", {
                clientOrderId: order.id,
                price,
                quantity: qty,
                requestClientId: newOrderId,
                strictValidate: true,
            }));
        }
    }

    cancelOrder(order: IOrder): void {
        this.orderManager.setOrderUnconfirmed(order.id);
        this.send(new HitBTCCommand("cancelOrder", {clientOrderId: order.id}));
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void {
        const orderId = generateOrderId(pair);
        this.orderManager.setOrderUnconfirmed(orderId);

        logger.info(`PRODUCTION ${side.toUpperCase()} ORDER! PRICE: ${price} SIZE: ${qty}`);
        this.send(new HitBTCCommand("newOrder", {
            clientOrderId: orderId,
            price,
            quantity: qty,
            side,
            symbol: pair,
            type: "limit",
        }));
    }

    loadCurrencies(): void {
        this.send(new HitBTCCommand("getSymbols"));
    }

    /**
     * Authenticates user on exchange using secure signed nonce
     * @param publicKey the public key
     * @param privateKey the private key
     */
    login(publicKey: string, privateKey: string): void {
        const nonce: string = nanoid(32);
        const signature: string = crypto.createHmac("sha256", privateKey).update(nonce).digest("hex");

        this.send(HitBTCCommand.createRestorable("login", {
            algo: "HS256",
            nonce,
            pKey: publicKey,
            signature,
        }));
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        this.getCandleManager(pair, interval, candles => this.emit("core.updateCandles", candles))
            .set(data);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        this.getCandleManager(pair, interval, candles => this.emit("core.updateCandles", candles))
            .update(data);
    }

    onSnapshotOrderbook({pair, ask, bid, sequence}: IOrderbookData) {
        const orderbook: Orderbook = this.getOrderbook(pair);
        orderbook.setOrders(ask, bid, sequence);

        this.emit("core.snapshotOrderbook", orderbook);
    }

    onUpdateOrderbook({pair, ask, bid, sequence}: IOrderbookData) {
        const orderbook: Orderbook = this.getOrderbook(pair);
        orderbook.addIncrement(ask, bid, sequence);

        this.emit("core.updateOrderbook", orderbook);
    }

    subscribeCandles(pair: Pair, interval: ICandleInterval): void {
        const command = HitBTCCommand.createRestorable("subscribeCandles", {
            symbol: pair.join(""),
            period: interval.code,
        });

        return this.send(command);
    }

    subscribeOrderbook = (pair: Pair): void => {
        const command = HitBTCCommand.createRestorable("subscribeOrderbook", {symbol: pair.join("")});
        this.send(command);
    };

    subscribeReports = (): void => {
        const command = HitBTCCommand.createRestorable("subscribeReports");
        this.send(command);
    };

    protected onConnect(): void {
        super.onConnect();

        this.getConnection().on("message", (data: Data) => this.adapter.onReceive(data));
        this.loadCurrencies();

        const auth = config.exchanges.hitbtc;
        if (auth.publicKey !== "" && auth.secretKey !== "") {
            logger.info("Live credentials are used!");
            this.login(auth.publicKey, auth.secretKey);
        }
    }
}
