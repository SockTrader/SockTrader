import {ChildProcess, fork} from "child_process";
import process from "process";
import config from "../../config";

export default (): ChildProcess => {

    // @TODO conditionally add execArgv
    const childProcess = fork(`${__dirname}/socketServer.js`, [], {
        stdio: ["ipc"],
        execArgv: [`--inspect=${config.socketServer.debugPort}`],
    });

    /**
     * Pipe output of child process to stdout of master process
     */
    childProcess.stdout.pipe(process.stdout);

    childProcess.on("exit", (code, signal) => {
        console.log("exit", {code, signal});
    });

    childProcess.on("error", msg => {
        console.log("error", msg);
    });

    /**
     * Re-emit incoming messages as separate events
     * This makes it easier to handle each event separately
     */
    childProcess.on("message", event => {
        if (!event.type) {
            throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
        }

        childProcess.emit(event.type, event.payload);
    });

    return childProcess;
};
