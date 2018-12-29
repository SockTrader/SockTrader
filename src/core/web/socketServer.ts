import fs from "fs";
import http, {Server} from "http";
import process from "process";
import {connection, IMessage, server as WebSocketServer} from "websocket";
import config from "../../config";
import {actions} from "./whitelist";

export default class SocketServer {
    private static PORT = config.socketServer.port;
    private client?: connection;
    private readonly httpServer: Server;

    private server: WebSocketServer;

    constructor() {
        this.httpServer = http.createServer((request, response) => {
            console.log((new Date()) + " Received request for " + request.url);
            response.writeHead(404);
            response.end();
        });

        this.server = new WebSocketServer({httpServer: this.httpServer});
        this.ipcReceive();
    }

    createWebMessage = (data: any): IMessage => ({
        type: "utf8",
        utf8Data: JSON.stringify(data),
    })

    /**
     * Initializes the socketServer.
     * -> starts to listen on a specified port
     * -> accepts requests coming from a certain frontend.
     */
    start() {
        this.httpServer.listen(SocketServer.PORT, () => {
            this.ipcSend(this.createWebMessage({type: "STATUS", payload: "ready"}));
            console.log(`SocketServer started on port ${SocketServer.PORT}`);
        });

        this.server.on("request", request => {
            // @TODO validate request, request.reject() if not valid

            if (this.client) {
                return console.error("Max 1 client allowed!");
            }

            this.client = request.accept("echo-protocol", request.origin);

            console.log((new Date()) + " Connection accepted.");
            this.client.on("message", this.ipcSend.bind(this));

            this.client.on("close", (reasonCode, description) => {
                if (this.client) console.log(`Client ${this.client.remoteAddress} disconnected.`, reasonCode, description);
                this.client = undefined;
            });
        });
    }

    /**
     * Receives events coming from the trading bot.
     * -> forward incoming events to a web client
     */
    private ipcReceive() {
        process.on("message", ({type, payload}) => {
            if (!type) {
                throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
            }

            // Send data if a client is connected.
            if (this.client) this.client.sendUTF(JSON.stringify({type, payload}));
        });
    }

    /**
     * Notify trading bot about things that are going on in the socketServer.
     * -> forward requests coming from a web frontend
     * -> notify when the server is initialized, new open connection, a closed connection, etc..
     * -> only allow whitelisted actions
     *
     * @param message
     */
    private ipcSend(message: IMessage) {
        if (message.type !== "utf8" || message.utf8Data === undefined) {
            return console.error("Incoming message is not correct");
        }

        const msg = JSON.parse(message.utf8Data);
        if (actions.indexOf(msg.type) > -1 && process.send !== undefined) {
            process.send(msg);
        }
    }
}

process.on("uncaughtException", err => {
    fs.writeSync(1, `Caught exception: ${err}\n`);
});

const webServer = new SocketServer();
webServer.start();
