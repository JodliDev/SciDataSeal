import express from "express"
import cookieParser from "cookie-parser"
import ViteExpress from "vite-express";
import {Options} from "./Options.ts";
import {FRONTEND_FOLDER} from "../shared/definitions/Constants.ts";
import {Cookies} from "../shared/definitions/Cookies.ts";
import LangProvider from "./LangProvider.ts";
import AuthenticateMiddleware from "./AuthenticateMiddleware.ts";
import setupDb from "./database/setupDb.ts";
import getSessionData from "./actions/authentication/getSessionData.ts";
import login from "./routes/login.ts";
import initialize from "./routes/initialize.ts";
import Scheduler from "./Scheduler.ts";
import deleteOutdatedSessions from "./actions/authentication/deleteOutdatedSessions.ts";
import setQuestionnaire from "./routes/setQuestionnaire.ts";
import saveData from "./routes/saveData.ts";
import setQuestionnaireColumns from "./routes/setQuestionnaireColumns.ts";
import getQuestionnaireData from "./routes/getQuestionnaireData.ts";
import setBlockchainAccount from "./routes/setBlockchainAccount.ts";
import generateRandomString from "./routes/generateRandomString.ts";
import getNewDenotation from "./routes/getNewDenotation.ts";
import AdminMiddleware from "./AdminMiddleware.ts";
import setUser from "./routes/setUser.ts";
import userSettings from "./routes/userSettings.ts";
import {FrontendOptionsString, recreateOptionsString} from "./actions/recreateOptionsString.ts";
import deleteEntry from "./routes/deleteEntry.ts";
import setStudy from "./routes/setStudy.ts";
import listEntries from "./routes/listEntries.ts";
import getEntry from "./routes/getEntry.ts";
import {Logger} from "./Logger.ts";
import syncBlockchain from "./actions/syncBlockchain.ts";
import syncBlockchainNow from "./routes/syncBlockchainNow.ts";
import getBalance from "./routes/getBalance.ts";
import logout from "./routes/logout.ts";

async function init() {
	const db = await setupDb()
	const authenticateMiddleware = AuthenticateMiddleware(db);
	const adminMiddleware = AdminMiddleware(db);
	const webServer = express();
	const scheduler = new Scheduler();
	await recreateOptionsString(db);
	
	scheduler.add("syncBlockchain", Options.blockchainSyncIntervalMinutes, () => {
		try {
			Logger.log("Syncing blockchain...");
			syncBlockchain(db);
		}
		catch(e) {
			Logger.error(`Could not sync blockchain: ${e}`);
		}
	});
	
	scheduler.add("deleteSessions", 24 * 60, () => {
		try {
			Logger.log("Deleting outdated sessions...");
			deleteOutdatedSessions(db);
		}
		catch(e) {
			Logger.error(`Error while deleting outdated sessions: ${e}`);
		}
	});
	
	webServer.use(express.json());
	webServer.use(express.urlencoded({ extended: false }));
	webServer.use(cookieParser());
	
	webServer.use("/api", login(db));
	webServer.use("/api", logout());
	if(!Options.isInit)
		webServer.use("/api", initialize(db));
	webServer.use("/api", saveData(db));
	webServer.use("/api", setQuestionnaireColumns(db));
	webServer.use("/api", setQuestionnaire(db));
	webServer.use("/api", authenticateMiddleware, listEntries(db));
	webServer.use("/api", authenticateMiddleware, getEntry(db));
	webServer.use("/api", authenticateMiddleware, deleteEntry(db));
	webServer.use("/api", authenticateMiddleware, setStudy(db));
	webServer.use("/api", authenticateMiddleware, userSettings(db));
	webServer.use("/api", authenticateMiddleware, getQuestionnaireData());
	webServer.use("/api", authenticateMiddleware, generateRandomString());
	webServer.use("/api", authenticateMiddleware, getNewDenotation(db));
	webServer.use("/api", adminMiddleware, syncBlockchainNow(scheduler));
	webServer.use("/api", adminMiddleware, setBlockchainAccount(db));
	webServer.use("/api", adminMiddleware, getBalance(db));
	webServer.use("/api", adminMiddleware, setUser(db));
	
	const langProvider = new LangProvider();
	
	async function transformer(html: string, request: express.Request): Promise<string> {
		const langCode = request.cookies[Cookies.langCode] ?? request.header("accept-language")?.substring(0, 2) ?? "en";
		return html
			.replace("<!-- lang -->", await langProvider.get(langCode))
			.replace("<!-- options -->", FrontendOptionsString)
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
	ViteExpress.listen(webServer, Options.port, async () =>
		{
			const { base } = await ViteExpress.getViteConfig();
			Logger.log(`WebServer is listening on http://localhost:${Options.port}${base}`);
		}
	);
}

init().then();