import {fork} from "child_process";
import minimist from "minimist";
import process from "process";
import config from "../../config";

const argv = minimist(process.argv.slice(2));

export default () => {
    const webServer = fork(`${__dirname}/webServer.js`, [], {
        stdio: ["ipc"],
        execArgv: argv.debug ? [`--inspect=${config.webServer.debugPort}`] : [],
    });

    webServer.stdout.pipe(process.stdout);

    webServer.on("exit", (code, signal) => {
        console.log("WebServer script exit: ", {code, signal});
    });

    webServer.on("error", msg => {
        console.log("WebServer script error: ", msg);
    });

    /**
     * Re-emit incoming messages as separate events
     * This makes it easier to handle each event separately
     */
    webServer.on("message", event => {
        if (!event.type) {
            throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
        }

        webServer.emit(event.type, event.payload);
    });

    /**
     * Kill webServer if the main process has stopped working..
     */
    process.on("exit", () => webServer.kill());

    return webServer;
};
