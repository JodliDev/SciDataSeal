import {UserConfig} from "vite";
import {FRONTEND_FOLDER} from "./src/shared/definitions/Constants";
import tsconfigPaths from "vite-tsconfig-paths";

// noinspection JSUnusedGlobalSymbols
export default {
	build: {
		outDir: `../../dist/${FRONTEND_FOLDER}`,
		emptyOutDir: true
	},
	plugins: [
		 tsconfigPaths() //to make sure that path aliases (e.g., @locales) still work in production
	]
} satisfies UserConfig