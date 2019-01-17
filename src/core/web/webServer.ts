import fs from "fs";
import http, {Server} from "http";
import ipc from "node-ipc";
import process from "process";
import {connection, IMessage, server as WebSocketServer} from "websocket";
import config from "../../config";
import {actions} from "./whitelist";

ipc.config.id = "webserver";
ipc.config.retry = 1000;
ipc.config.silent = false;

/**
 * The WebServer communicates with the dashboard for trading visualizations
 */
export default class WebServer {
    private static PORT = config.webServer.port;
    private client?: connection;
    private readonly httpServer: Server;

    private server: WebSocketServer;

    /**
     * Creates a new webserver
     */
    constructor() {
        this.httpServer = http.createServer((request, response) => {
            console.log((new Date()) + " Received request for " + request.url);
            response.writeHead(404);
            response.end();
        });

        this.server = new WebSocketServer({httpServer: this.httpServer});
        this.connectIPC();
    }

    /**
     * Wraps the data with correct type and stringifies json
     * for transit
     * @param data the data to use
     * @returns {IMessage} the wrapped data as a message
     */
    createWebMessage = (data: any): IMessage => ({
        type: "utf8",
        utf8Data: JSON.stringify(data),
    })

    /**
     * Initializes the WebSocketServer.
     * -> starts to listen on a specified port
     * -> accepts requests coming from a certain frontend.
     */
    start() {
        this.httpServer.listen(WebServer.PORT, () => console.log(`WebServer ready on: ${WebServer.PORT}`));

        this.server.on("request", request => {
            // @TODO validate request, request.reject() if not valid

            if (this.client) {
                return console.error("Max 1 client allowed!");
            }

            this.client = request.accept("echo-protocol", request.origin);

            console.log((new Date()) + " Connection accepted.");
            this.client.on("message", ({type, utf8Data}: IMessage) => {
                if (type !== "utf8" || utf8Data === undefined) {
                    return console.error("Incoming message is not correct");
                }

                this.ipcSend(JSON.parse(utf8Data));
            });

            this.client.on("close", (reasonCode, description) => {
                if (this.client) console.log(`Client ${this.client.remoteAddress} disconnected.`, reasonCode, description);
                this.client = undefined;
            });
        });
    }

    /**
     * Webserver listens to messages from socketTrader
     */
    private connectIPC() {
        ipc.connectTo("server", () => {
            ipc.of.server.on("connect", () => {
                // ipc.log("IPC Connected to server!");
                ipc.of.server.emit("STATUS", {payload: "IPC ready"});
            });

            ipc.of.server.on("disconnect", () => {
                ipc.log("IPC Disconnected!");
            });

            this.ipcReceive();
        });
    }

    /**
     * Receives events coming from the trading bot
     * -> forward incoming events to the WebSocketServer
     */
    private ipcReceive() {
        ipc.of.server.on("ipc.message", ({type, payload}: { payload: any, type: string }) => {
            ipc.log("WebServer server received a message!", type);

            if (!type) {
                throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
            }

            // Send data if a client is connected.
            if (this.client) this.client.sendUTF(JSON.stringify({type, payload}));
        });
    }

    /**
     * Notify trading bot about things that are going on in the WebSocketServer.
     * -> forward requests coming from a web frontend
     * -> notify when the server is initialized, new open connection, a closed connection, etc..
     * -> only allow whitelisted actions
     *
     * @param message
     */
    private ipcSend({type, payload}: { payload: any, type: string }) {
        if (actions.indexOf(type) > -1 && process.send !== undefined) {
            ipc.of.server.emit(type, payload);
        }
    }
}

process.on("uncaughtException", err => {
    fs.writeSync(1, `Caught exception: ${err}\n`);
});

const webServer = new WebServer();
webServer.start();
