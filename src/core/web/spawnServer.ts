import {ChildProcess, fork} from "child_process";
import process from "process";

export default (): ChildProcess => {
    const childProcess = fork(`${__dirname}/socketServer.js`, [], {stdio: ["ipc"]});
    childProcess.stdout.pipe(process.stdout);

    childProcess.on("exit", msg => {
        console.log("exit", msg);
    });

    childProcess.on("error", msg => {
        console.log("error", msg);
    });

    childProcess.on("message", event => {
        if (!event.type) {
            throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
        }

        childProcess.emit(event.type, event.payload);
    });

    return childProcess;
};
