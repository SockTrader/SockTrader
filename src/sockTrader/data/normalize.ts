import ora from "ora";
import {normalizeDataFolder} from "./normalizer";

const spinner = ora("Normalizing data").start();
normalizeDataFolder().then(() => spinner.succeed("Normalization finished!"));
