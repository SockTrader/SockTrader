import {Data} from "../connection/wsConnection";

export interface ResponseAdapter {
    onReceive(msg: Data): void;
}
