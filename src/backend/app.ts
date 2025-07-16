import express from 'express'
import cookieParser from "cookie-parser"
import ViteExpress from "vite-express";
import {Options} from "./Options.ts";
import {FRONTEND_FOLDER} from "../shared/Constants.ts";
import solana from "./routes/solana.ts";
import {Cookies} from "../shared/Cookies.ts";
import LangProvider from "./LangProvider.ts";
import {FrontendOptions} from "../shared/FrontendOptions.ts";
import AuthenticateMiddleware from "./AuthenticateMiddleware.ts";
import setupDb from "./database/setupDb.ts";
import getSessionData from "./actions/getSessionData.ts";
import login from "./routes/login.ts";

async function init() {
	const db = await setupDb()
	const authenticateMiddleware = AuthenticateMiddleware(db);
	const webServer = express();
	
	webServer.use(express.json());
	webServer.use(express.urlencoded({ extended: false }));
	webServer.use(cookieParser());
	
	webServer.use("/api", authenticateMiddleware, solana);
	webServer.use("/api", login(db));
	
	const langProvider = new LangProvider();
	const optionsString = JSON.stringify(
		{
			urlPath: Options.urlPath
		} satisfies FrontendOptions
	);
	
	async function transformer(html: string, request: express.Request): Promise<string> {
		const langCode = request.cookies[Cookies.langCode] ?? request.header("accept-language")?.substring(0, 2) ?? "en";
		return html
			.replace("<!-- lang -->", await langProvider.get(langCode))
			.replace("<!-- options -->", optionsString)
			.replace("<!-- session -->", JSON.stringify(await getSessionData(db, request)));
	}
	
	
	ViteExpress.config({
		mode: Options.mode,
		transformer: transformer,
		inlineViteConfig: {
			root: Options.mode == "development" ? `./src/${FRONTEND_FOLDER}` : Options.root,
			build: {
				outDir: FRONTEND_FOLDER,
			}
		}
	});
	ViteExpress.listen(webServer, Options.port, async () => {
			const { base } = await ViteExpress.getViteConfig();
			console.log(`WebServer is listening on http://localhost:${Options.port}${base}`);
		}
	);
	
}

init().then();