import http, {Server} from "http";
import process from "process";
import {IMessage, IServerConfig, server as WebSocketServer} from "websocket";

export default class SocketServer extends WebSocketServer {
    private static PORT = 8080;

    private server: Server;

    constructor() {
        const server = http.createServer((request, response) => {
            console.log((new Date()) + " Received request for " + request.url);
            response.writeHead(404);
            response.end();
        });

        const config: IServerConfig = {httpServer: server};
        super(config);

        this.server = server;
        this.ipcReceive();
    }

    start() {
        this.server.listen(SocketServer.PORT, () => {
            this.ipcSend({type: "STATUS", payload: "ready"});
            console.log(`SocketServer started on port ${SocketServer.PORT}`);
        });

        this.on("request", request => {
            // if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            // request.reject();
            // console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
            // return;
            // }

            /**
             * @TODO do something with multiple connections..
             * Solution: broadcast to all clients??
             */

            const connection = request.accept("echo-protocol", request.origin);

            console.log((new Date()) + " Connection accepted.");
            connection.on("message", (message: IMessage) => {
                if (message.type === "utf8" && message.utf8Data !== undefined) {
                    console.log("Received Message: " + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                } else if (message.type === "binary" && message.binaryData !== undefined) {
                    console.log("Received Binary Message of " + message.binaryData.length + " bytes");
                    connection.sendBytes(message.binaryData);
                }
            });
            connection.on("close", (reasonCode, description) => {
                console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.", reasonCode, description);
            });
        });
    }

    private ipcReceive() {
        process.on("message", event => {
            if (!event.type) {
                throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
            }

            // @TODO Should we use an internal emit here??
            // @TODO Or directly send the events to all the active connections??
            this.emit(event.type, event.payload);
        });
    }

    private ipcSend(message: any) {
        if (process.send !== undefined) {
            process.send(message);
        }
    }
}

const webServer = new SocketServer();
webServer.start();
