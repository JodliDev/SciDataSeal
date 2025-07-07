/// <reference types="vitest" />

import {UserConfig} from "vite";
import * as path from "node:path";

// !!!!!!!!!!
// Be aware: The backend is starting its own vite server which uses an inline config (see src/backend/app.ts)
// !!!!!!!!!!

export default {
	publicDir: "src/frontend/public",
	test: {
		root: "./",
		environment: "happy-dom",
		coverage: {
			enabled: true,
			provider: 'v8',
			reporter: ["text", "json", "html"],
			include: ["src/**/*"],
		},
		//Make CSS class names readable:
		css: {
			modules: {
				classNameStrategy: 'non-scoped'
			}
		}
	},
	resolve: {
		alias: {
			"@locales": path.resolve(__dirname, "./locales/")
		}
	}
} satisfies UserConfig
