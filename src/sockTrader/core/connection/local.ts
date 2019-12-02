import {EventEmitter} from "events";
import {Command, Connection} from "../types/Connection";

export default class Local extends EventEmitter implements Connection {

    constructor() {
        super();
    }

    send(command: object) {
        // ignore
    }

    connect(): void {
        // ignore
    }

    addRestorable(command: Command): void {
        // ignore
    }
}
