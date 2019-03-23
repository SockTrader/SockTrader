import express, {RequestHandler} from "express";
import * as fs from "fs";
import {extname, resolve} from "path";

const router = express.Router();
const BASE_PATH = "../../../strategies";
const ext = ".js";

type StrategyListing = Array<{
    id: string,
    strategy: string,
}>;

export const strategyListHandler: RequestHandler = async (req, res) => {
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
};

// GET: /strategy/list
router.get("/list", strategyListHandler);

export default router;
