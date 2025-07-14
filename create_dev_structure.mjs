import {dirname, resolve} from "node:path";
import {existsSync, mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configFolder = resolve(__dirname, "./", "config");
if(!existsSync(configFolder))
	mkdirSync(configFolder, {recursive: true});