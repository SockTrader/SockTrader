import boom from "boom";
import express from "express";
import * as fs from "fs";
import {extname, resolve} from "path";
import {promisify} from "util";

const router = express.Router();
const BASE_PATH = "../../../data";
const ext = ".json";

type FileListing = Array<{
    file: string,
    id: string,
}>;

// GET: /data
router.get("/", async (req, res, next) => {
    if (!req.query.file) return next(boom.badRequest("'file' argument is not defined"));

    try {
        const file = resolve(__dirname, BASE_PATH, (Buffer.from(req.query.file, "base64")).toString() + ext);
        const stats = await (promisify(fs.stat))(file);

        if (stats.isFile()) return res.sendFile(file);

        return next(boom.badImplementation("File is not a valid JSON file"));
    } catch (e) {
        return next(boom.badImplementation(e));
    }
});

// GET: /data/list
router.get("/list", (req, res) => {
    fs.readdir(resolve(__dirname, BASE_PATH), (err, files) => {
        const dataFiles: FileListing = [];

        files.forEach(file => {
            if (extname(file) === ext) {
                const fileName = file.replace(ext, "");
                dataFiles.push({
                    file: fileName,
                    id: (Buffer.from(fileName)).toString("base64"),
                });
            }
        });

        res.send(dataFiles);
    });
});

export default router;
