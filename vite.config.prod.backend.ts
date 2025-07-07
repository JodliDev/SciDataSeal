import {UserConfig} from "vite";
import nodeExternals from "rollup-plugin-node-externals";
import tsconfigPaths from "vite-tsconfig-paths";

// noinspection JSUnusedGlobalSymbols
export default {
	build: {
		rollupOptions: {
			input: {
				server: `./src/backend/app.ts`,
			},
			output: {
				entryFileNames: "[name].js",
				dir: "./dist/backend"
			}
		},
	},
	plugins: [
		nodeExternals(), //to tell vite that node packages should not be bundled because the runtime (node) already knows them
		tsconfigPaths() //to make sure that path aliases (e.g., @locales) still work in production
	]
} satisfies UserConfig