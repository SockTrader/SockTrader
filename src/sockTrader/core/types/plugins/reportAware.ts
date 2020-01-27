import {Order} from "../order";

export interface ReportAware {
    onReport(order: Order): void;
}

export const isReportAware = (plugin: any): plugin is ReportAware => plugin.onReport !== undefined;
