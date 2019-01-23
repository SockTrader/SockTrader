import fs from "fs";
import http, {Server} from "http";
import process from "process";
import {connection, IMessage, request, server as WebSocketServer} from "websocket";
import config from "../../../config";
import {actions} from "./whitelist";

/**
 * The WebServer communicates with the dashboard for trading visualizations
 */
class WebServer {
    private static PORT = config.webServer.port;
    private client?: connection;
    private readonly httpServer: Server;

    private server: WebSocketServer;

    /**
     * Creates a new webserver
     */
    constructor() {
        this.ipcReceive();
        this.httpServer = http.createServer((req, resp) => {
            console.log((new Date()) + " Received request for " + req.url);
            resp.writeHead(404);
            resp.end();
        });

        this.server = new WebSocketServer({httpServer: this.httpServer});
    }

    /**
     * Initializes the WebSocketServer.
     * -> starts to listen on a specified port
     * -> accepts requests coming from a certain frontend.
     */
    start() {
        this.httpServer.listen(WebServer.PORT, () => {
            console.log(`WebServer listening on port: ${WebServer.PORT}`);
            this.ipcSend({type: "READY"});
        });

        this.server.on("request", (req: request) => {
            // @TODO validate request, request.reject() if not valid

            if (this.client) {
                return console.error("Max 1 client allowed!");
            }

            this.client = req.accept("echo-protocol", req.origin);

            console.log((new Date()) + " Connection accepted.");
            this.client.on("message", ({type, utf8Data}: IMessage) => {
                if (type !== "utf8" || utf8Data === undefined) {
                    return console.error("Incoming message is not correct");
                }

                const msg = JSON.parse(utf8Data);
                if (actions.indexOf(msg.type) > -1) this.ipcSend(msg);
            });

            this.client.on("close", (reasonCode, description) => {
                if (this.client) console.log(`Client ${this.client.remoteAddress} disconnected.`, reasonCode, description);
                this.client = undefined;
            });
        });
    }

    /**
     * Forward file content to frontend
     * @param cacheFile
     */
    private forwardCacheFile(cacheFile: string) {
        const fileContent = fs.readFileSync(cacheFile, "utf8");
        if (this.client) this.client.sendUTF(fileContent);
    }

    /**
     * Receives events coming from the trading bot
     * -> forward incoming events to the WebSocketServer
     */
    private ipcReceive() {
        process.on("message", ({type, payload}) => {
            if (!type) {
                throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
            }

            if (type === "CANDLE_FILE") {
                return this.forwardCacheFile(payload);
            }

            // Send data if a client is connected.
            if (this.client) this.client.sendUTF(JSON.stringify({type, payload}));
        });
    }

    /**
     * Notify trading bot about things that are going on in the frontend.
     * -> forward requests coming from a web frontend
     * -> notify when the server is initialized, new open connection, a closed connection, etc..
     * -> only allow whitelisted actions
     *
     * @param msg
     */
    private ipcSend(msg: any) {
        if (process.send !== undefined) process.send(msg);
    }
}

process.on("uncaughtException", err => {
    fs.writeSync(1, `Caught exception: ${err}\n`);
});

const webServer = new WebServer();
webServer.start();
