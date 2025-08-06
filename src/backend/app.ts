import express from "express"
import cookieParser from "cookie-parser"
import ViteExpress from "vite-express";
import {Options} from "./Options.ts";
import {FRONTEND_FOLDER} from "../shared/definitions/Constants.ts";
import {Cookies} from "../shared/definitions/Cookies.ts";
import LangProvider from "./LangProvider.ts";
import {FrontendOptionsString, recreateOptionsString} from "../shared/FrontendOptions.ts";
import AuthenticateMiddleware from "./AuthenticateMiddleware.ts";
import setupDb from "./database/setupDb.ts";
import getSessionData from "./actions/authentication/getSessionData.ts";
import login from "./routes/login.ts";
import initialize from "./routes/initialize.ts";
import Scheduler from "./Scheduler.ts";
import deleteOutdatedSessions from "./actions/authentication/deleteOutdatedSessions.ts";
import editQuestionnaire from "./routes/editQuestionnaire.ts";
import listQuestionnaires from "./routes/listQuestionnaires.ts";
import getQuestionnaire from "./routes/getQuestionnaire.ts";
import saveData from "./routes/saveData.ts";
import setQuestionnaireColumns from "./routes/setQuestionnaireColumns.ts";
import getQuestionnaireData from "./routes/getQuestionnaireData.ts";
import editBlockchainAccount from "./routes/editBlockchainAccount.ts";
import listBlockchainAccounts from "./routes/listBlockchainAccounts.ts";
import getBlockchainAccount from "./routes/getBlockchainAccount.ts";
import generateRandomString from "./routes/generateRandomString.ts";
import getNewDenotation from "./routes/getNewDenotation.ts";
import AdminMiddleware from "./AdminMiddleware.ts";
import editUser from "./routes/editUser.ts";
import listUser from "./routes/listUser.ts";
import getUser from "./routes/getUser.ts";
import deleteUser from "./routes/deleteUser.ts";
import deleteBlockchainAccount from "./routes/deleteBlockchainAccount.ts";
import deleteQuestionnaire from "./routes/deleteQuestionnaire.ts";
import userSettings from "./routes/userSettings.ts";

async function init() {
	const db = await setupDb()
	const authenticateMiddleware = AuthenticateMiddleware(db);
	const adminMiddleware = AdminMiddleware(db);
	const webServer = express();
	const scheduler = new Scheduler(Options.schedulerHourOfDay);
	await recreateOptionsString(db);
	
	scheduler.add(() => {
		deleteOutdatedSessions(db);
	})
	
	webServer.use(express.json());
	webServer.use(express.urlencoded({ extended: false }));
	webServer.use(cookieParser());
	
	webServer.use("/api", login(db));
	if(!Options.isInit)
		webServer.use("/api", initialize(db));
	webServer.use("/api", saveData(db));
	webServer.use("/api", setQuestionnaireColumns(db));
	webServer.use("/api", authenticateMiddleware, userSettings(db));
	webServer.use("/api", authenticateMiddleware, editQuestionnaire(db));
	webServer.use("/api", authenticateMiddleware, deleteQuestionnaire(db));
	webServer.use("/api", authenticateMiddleware, listBlockchainAccounts(db));
	webServer.use("/api", authenticateMiddleware, listQuestionnaires(db));
	webServer.use("/api", authenticateMiddleware, getQuestionnaire(db));
	webServer.use("/api", authenticateMiddleware, getQuestionnaireData());
	webServer.use("/api", authenticateMiddleware, generateRandomString());
	webServer.use("/api", authenticateMiddleware, getNewDenotation(db));
	webServer.use("/api", adminMiddleware, editBlockchainAccount(db));
	webServer.use("/api", adminMiddleware, getBlockchainAccount(db));
	webServer.use("/api", adminMiddleware, deleteBlockchainAccount(db));
	webServer.use("/api", adminMiddleware, editUser(db));
	webServer.use("/api", adminMiddleware, listUser(db));
	webServer.use("/api", adminMiddleware, getUser(db));
	webServer.use("/api", adminMiddleware, deleteUser(db));
	
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
	ViteExpress.listen(webServer, Options.port, async () => {
			const { base } = await ViteExpress.getViteConfig();
			console.log(`WebServer is listening on http://localhost:${Options.port}${base}`);
		}
	);
}

init().then();