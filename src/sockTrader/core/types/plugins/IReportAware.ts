import {IOrder} from "../order";

export interface IReportAware {
    onReport: (order: IOrder) => void;
}

export const isReportAware = (plugin: any): plugin is IReportAware => plugin.onReport !== undefined;
