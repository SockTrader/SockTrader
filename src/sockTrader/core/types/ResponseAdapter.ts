import {Data} from "../connection/webSocket";

export interface ResponseAdapter {
    onReceive(msg: Data): void;
}
