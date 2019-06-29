import {exchanges} from "../core/exchanges";

export function listExchanges() {
    exchanges.forEach(exchange => {
        console.log("\x1b[4m\x1b[36m%s\x1b[0m", exchange.name);
        console.table(exchange.intervals);
    });
}
