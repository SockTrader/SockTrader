// import boom from "boom";
import express from "express";
import * as fs from "fs";
import {extname, resolve} from "path";

// import {promisify} from "util";

const router = express.Router();
const BASE_PATH = "../../../strategies";
const ext = ".js";

type StrategyListing = Array<{
    id: string,
    strategy: string,
}>;

// GET: /strategy/list
router.get("/list", async (req, res, next) => {
    fs.readdir(resolve(__dirname, BASE_PATH), (err, files) => {
        const dataFiles: StrategyListing = [];

        files.forEach(file => {
            if (extname(file) === ext) {
                const fileName = file.replace(ext, "");
                dataFiles.push({
                    strategy: fileName,
                    id: (Buffer.from(fileName)).toString("base64"),
                });
            }
        });

        res.send(dataFiles);
    });
});

export default router;
