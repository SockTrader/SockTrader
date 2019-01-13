import {fork} from "child_process";
import ipc from "node-ipc";
import config from "../../config";

export default () => {

    // @TODO conditionally add execArgv
    const childProcess = fork(`${__dirname}/webServer.js`, [], {
        stdio: "inherit",
        silent: true,
        execArgv: [`--inspect=${config.webServer.debugPort}`],
    });
    // const childProcess = fork(`${__dirname}/webServer.js`, [], {
    //     stdio: ["ipc"],
    //     silent: true,
    //     stdio: ["inherit"],
    //     execArgv: [`--inspect=${config.webServer.debugPort}`],
    // });

    /**
     * Pipe output of child process to stdout of master process
     */
    // childProcess.stdout.pipe(process.stdout);

    childProcess.on("exit", (code, signal) => {
        console.log("WebServer script exit: ", {code, signal});
    });

    childProcess.on("error", msg => {
        console.log("WebServer script error: ", msg);
    });

    ipc.config.id = "server";
    ipc.config.retry = 1500;
    ipc.config.silent = false;

    ipc.serve();
    ipc.server.start();

    return ipc.server;
};
