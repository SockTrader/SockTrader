import crypto from "crypto";
import nanoid from "nanoid";
import {connection, IMessage} from "websocket";
import {Pair} from "../../types/pair";
import CandleCollection, {ICandle, ICandleInterval, IIntervalDict} from "../candleCollection";
import logger from "../logger";
import Orderbook from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";
import BaseExchange, {IOrderbookData, IResponseMapper} from "./baseExchange";
import HitBTCMapper from "./hitBTCMapper";

export const CandleInterval: IIntervalDict = {
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

export default class HitBTC extends BaseExchange {

    readonly mapper: IResponseMapper = new HitBTCMapper(this);
    private static instance?: HitBTC;
    private sequence = 0;

    constructor(private pubKey = "", private secKey = "") {
        super();
    }

    static getInstance(pKey = "", sKey = "") {
        if (!HitBTC.instance) {
            HitBTC.instance = new HitBTC(pKey, sKey);
        }
        return HitBTC.instance;
    }

    /**
     * Adjusts existing order on exchange
     * @param order
     * @param price
     * @param qty
     */
    adjustOrder(order: IOrder, price: number, qty: number): void {
        if (this.isAdjustingOrderAllowed(order, price, qty)) {
            const newOrderId = this.generateOrderId(order.pair);

            this.send("cancelReplaceOrder", {
                clientOrderId: order.id,
                price,
                quantity: qty,
                requestClientId: newOrderId,
                strictValidate: true,
            });
        }
    }

    /**
     * Cancel existing order on exchange
     */
    cancelOrder(order: IOrder): void {
        this.setOrderInProgress(order.id);
        this.send("cancelOrder", {clientOrderId: order.id});
    }

    connect() {
        super.connect("wss://api.hitbtc.com/api/2/ws");
    }

    /**
     * Sends new order to exchange
     */
    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): string {
        const orderId = super.createOrder(pair, price, qty, side);

        logger.info(`${side.toUpperCase()} ORDER! PRICE: ${price} SIZE: ${qty}`);
        this.send("newOrder", {
            clientOrderId: orderId,
            price,
            quantity: qty,
            side,
            symbol: pair,
            type: "limit",
        });
        return orderId;
    }

    /**
     * Shortcut function for receiving tradeable symbols via socket
     */
    loadCurrencies(): void {
        this.send("getSymbols");
    }

    /**
     * Authenticates user on exchange using secure signed nonce
     * @param publicKey
     * @param privateKey
     */
    login(publicKey: string, privateKey: string): void {
        const nonce: string = nanoid(32);
        const signature: string = crypto.createHmac("sha256", privateKey).update(nonce).digest("hex");

        this.send("login", {
            algo: "HS256",
            nonce,
            pKey: publicKey,
            signature,
        });
    }

    /**
     * Update candles
     */
    onUpdateCandles<K extends keyof CandleCollection>(pair: Pair, data: ICandle[], interval: ICandleInterval, method: Extract<K, "set" | "update">): void {
        const candleCollection = this.getCandleCollection(pair, interval, candles => this.emit("app.updateCandles", candles));
        return candleCollection[method](data);
    }

    /**
     * Update internal order book for a trading pair
     */
    onUpdateOrderbook<K extends keyof Orderbook>(response: IOrderbookData, method: Extract<K, "setOrders" | "addIncrement">): void {
        if (response.sequence <= this.sequence) {
            logger.info(`Sequence dropped: ${response.sequence}, last one: ${this.sequence}`);
            return;
        }

        this.sequence = response.sequence;
        const orderbook: Orderbook = this.getOrderbook(response.pair);
        orderbook[method](response.ask, response.bid);

        this.emit("app.updateOrderbook", orderbook);
    }

    subscribeCandles = (pair: Pair, interval: ICandleInterval): void => this.send("subscribeCandles", {
        symbol: pair,
        period: interval.code,
    })

    subscribeOrderbook = (pair: Pair): void => this.send("subscribeOrderbook", {symbol: pair});

    subscribeReports = (): void => this.send("subscribeReports");

    protected onConnect(conn: connection): void {
        super.onConnect(conn);

        conn.on("message", (data: IMessage) => this.mapper.onReceive(data));

        this.loadCurrencies();

        if (this.pubKey !== "" && this.secKey !== "") {
            logger.info("Live credentials are used!");
            this.login(this.pubKey, this.secKey);
        }
    }
}
