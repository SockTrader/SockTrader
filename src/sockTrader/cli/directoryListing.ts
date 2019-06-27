import path from "path";
import {getBaseFilenames, loadFiles} from "./util";

export async function listStrategies() {
    const files = await loadFiles(path.resolve(__dirname, "./strategies"));
    getBaseFilenames(files).forEach(f => console.log(f));
}

export async function listCandles() {
    const files = await loadFiles(path.resolve(__dirname, "./data"));
    getBaseFilenames(files).forEach(f => console.log(f));
}
