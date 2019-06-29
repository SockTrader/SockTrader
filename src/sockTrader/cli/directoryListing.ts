import path from "path";
import {getBaseFilenames, loadFiles} from "./util";

export async function listStrategies() {
    const files = await loadFiles(path.resolve(__dirname, "./../../strategies"));
    console.table(getBaseFilenames(files));
}

export async function listCandles() {
    const files = await loadFiles(path.resolve(__dirname, "./../../data"));
    console.table(getBaseFilenames(files));
}
