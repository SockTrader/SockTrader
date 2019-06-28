import fs from "fs";
import path from "path";
import util from "util";

export async function loadStrategy(strategyFilename: string) {
    const strategyPath = path.resolve(__dirname, "./../../strategies", strategyFilename);
    return await import(strategyPath);
}

export async function loadCandleFile(candleFilename: string) {
    const candlePath = path.resolve(__dirname, "./../../data", `${candleFilename}.json`);
    return await import(candlePath);
}

export async function loadFiles(folder: string) {
    const readdir = util.promisify(fs.readdir);
    return await readdir(path.resolve(folder));
}

export function getBaseFilenames(files: string[]): string[] {
    return files
        .map(f => f.split(".")[0])
        .filter((value, index, self) => self.indexOf(value) === index);
}
