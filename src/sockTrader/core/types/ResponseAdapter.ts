import {Data} from "../connection/webSocket";

export interface IResponseAdapter {
    onReceive(msg: Data): void;
}
