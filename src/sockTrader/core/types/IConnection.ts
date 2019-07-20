import {EventEmitter} from "events";

export interface ICommand {
    method: string;
    params: object;
    id: string;
}

export interface IConnection extends EventEmitter {

    send(command: ICommand): void;

    addRestorable(command: ICommand): void;

    connect(): void;
}
