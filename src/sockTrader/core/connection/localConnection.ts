import {EventEmitter} from "events";
import {Command, Connection} from "../types/connection";

export default class LocalConnection extends EventEmitter implements Connection {

    constructor() {
        super();
    }

    send(command: object) {
        // ignore
    }

    connect(): void {
        this.emit("open");
    }

    addRestorable(command: Command): void {
        // ignore
    }
}
