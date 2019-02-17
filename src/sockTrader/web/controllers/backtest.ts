import boom from "boom";
import {ChildProcess, fork} from "child_process";
import express from "express";
import path from "path";
// import * as fs from "fs";
// import {resolve} from "path";
// import process from "process";
// import {promisify} from "util";
// import config from "../../../config";

const router = express.Router();
const BASE_PATH = "../../../";

// POST: /backtest/new
router.post("/new", async (req, res, next) => {
    if (!req.body.file) {
        return next(boom.badRequest("'file' argument is not defined"));
    }

    const rawFile = Buffer.from(req.body.file, "base64").toString();
    const file = path.resolve(__dirname, BASE_PATH, `data/${rawFile}.json`);

    const scriptPath = path.resolve(__dirname, BASE_PATH, "backtest.js");
    const process: ChildProcess = fork(scriptPath, [`--candles=${file}`]);

    res.send({pid: process.pid});

    // webServer.stdout.pipe(process.stdout);
    //
    // webServer.on("exit", (code, signal) => {
    //     console.log("WebServer script exit: ", {code, signal});
    // });
    //
    // webServer.on("error", msg => {
    //     console.log("WebServer script error: ", msg);
    // });

    /**
     * Re-emit incoming messages as separate events
     * This makes it easier to handle each event separately
     */
    // webServer.on("message", event => {
    //     if (!event.type) {
    //         throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
    //     }
    //
    //     webServer.emit(event.type, event.payload);
    // });

    /**
     * Kill webServer if the main process has stopped working..
     */
    // process.on("exit", () => webServer.kill());
    //
    // return webServer;

    // res.send(req.body);
    //
    // try {
    //     return next(boom.badImplementation("File is not a valid JSON file"));
    // } catch (e) {
    //     return next(boom.badImplementation(e));
    // }
});

export default router;
