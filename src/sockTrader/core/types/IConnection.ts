import {EventEmitter} from "events";

export interface ICommand {
    restorable: boolean;

    toCommand(): object;
}

export interface IConnection extends EventEmitter {

    send(command: object): void;

    addRestorable(command: ICommand): void;

    connect(): void;
}
