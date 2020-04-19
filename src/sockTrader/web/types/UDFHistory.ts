import * as core from "express-serve-static-core";

export interface HistoryParams extends core.ParamsDictionary {
    from: string;
}
