#!/usr/bin/env node

import {existsSync, mkdirSync, writeFile} from "node:fs";
import {resolve, dirname} from "node:path";
import packageJson from "./package.json" with { type: 'json' };
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const distFolder = resolve(__dirname, "./", "dist");
if(!existsSync(distFolder))
	mkdirSync(distFolder, {recursive: true});

packageJson.type = "module";
packageJson.scripts = {
	server: "node ./backend/server.js -- mode=production frontendPath=frontend"
}
writeFile(resolve(__dirname, "./", "dist", "package.json"), JSON.stringify(packageJson), err => {
	if (err)
		console.error(err);
	else
		console.log("Created package.json");
});
