import {exchanges, IExchangeDefinition} from "../core/exchanges";

export function listExchanges() {
    for (const exchange of Object.keys(exchanges)) {
        console.log("\x1b[4m\x1b[36m%s\x1b[0m", exchange);
        console.table(getExchangeConfig(exchanges[exchange]));
    }
}

function getExchangeConfig({intervals}: IExchangeDefinition) {
    return Object.keys(intervals).reduce((prevValue, index) => {
        const {code, ...rest}: any = intervals[index];
        prevValue[index] = rest;

        return prevValue;
    }, [] as any);
}
