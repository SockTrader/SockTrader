import {EventEmitter} from "events";
import WSWebSocket from "ws";
import logger from "../logger";

export type Data = WSWebSocket.Data;
export default class WebSocket extends EventEmitter {

    private latency = 1000;
    private pingTimeout?: NodeJS.Timeout;
    private connection?: WSWebSocket;
    private restoreCommands: object[] = [];
    private isReconnecting = false;

    constructor(private readonly connectionString: string, private readonly pingInterval: number) {
        super();
    }

    /**
     * The connection will be closed automatically if the server is unable to reply
     * within a predefined amount of time.
     */
    private heartbeat() {
        if (this.pingTimeout) global.clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            logger.info(`Connection lost with remote exchange.`);

            if (this.connection) this.connection.terminate();
        }, this.pingInterval + this.latency);
    }

    /**
     * Prevent memory leak by removing all event listeners and clear timeout
     */
    private cleanUp() {
        if (this.connection) this.connection.removeAllListeners();
        if (this.pingTimeout) global.clearTimeout(this.pingTimeout);
    }

    private reconnect() {
        this.isReconnecting = true;
        global.setTimeout(() => this.connect(), 500);
    }

    private onClose(code: number, reason: string) {
        logger.info(`Connection closed: ${code} ${reason}`);
        this.cleanUp();
        this.reconnect();
    }

    private onError(error: Error) {
        logger.error(`WebSocket error: ${error.message}`);
    }

    private onMessage(data: WSWebSocket.Data) {
        this.emit("message", data);
    }

    private onOpen() {
        logger.info(`Connection established!`);
        this.emit("open");

        // Restore state as before the connection was closed
        if (this.isReconnecting) this.restoreCommands.forEach(command => this.send(command));
        this.isReconnecting = false;

        this.heartbeat();
    }

    private onPing() {
        this.heartbeat();
    }

    addRestorable(command: object = {}) {
        this.restoreCommands.push(command);
    }

    send(command: object = {}) {
        if (!this.connection) throw new Error("No connection available.");

        this.connection.send(JSON.stringify(command));
    }

    connect(): void {
        this.connection = new WSWebSocket(this.connectionString, {perMessageDeflate: false});

        this.connection.on("close", (code, reason): void => this.onClose(code, reason));
        this.connection.on("open", () => this.onOpen());
        this.connection.on("ping", () => this.onPing());
        this.connection.on("error", error => this.onError(error));
        this.connection.on("message", data => this.onMessage(data));
        this.connection.on("unexpected-response", () => logger.info(`Unexpected response`));
    }
}
