import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions} from "sqlmorpheus";

export interface KyselyTables {
	User: User
	Session: Session
}
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 1,
	configPath: `${process.cwd()}/config/`,
	tables: [
		SessionTable,
		UserTable
	]
} satisfies DatabaseInstructions