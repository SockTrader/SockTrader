import {EventEmitter} from "events";

export interface Command {
    restorable: boolean;

    toCommand(): object;
}

export interface Connection extends EventEmitter {

    send(command: object): void;

    addRestorable(command: Command): void;

    connect(): void;
}
