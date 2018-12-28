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
        childProcess.emit(event.type, event.payload);
    });

    return childProcess;
};
