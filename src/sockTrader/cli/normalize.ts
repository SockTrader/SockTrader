import ora from "ora";
import {normalizeDataFolder} from "../data/normalizer";

export async function normalize() {
    const spinner = ora("Normalizing data").start();

    try {
        await normalizeDataFolder();
        spinner.succeed("Normalization finished!");
    } catch (e) {
        spinner.fail("Normalization failed. Please try again or submit a bug report");
        console.error(e);
    }
}
