import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions, PublicMigrations, SqlChanges} from "sqlmorpheus";

export interface KyselyTables {
	User: User
	Session: Session
}
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 2,
	configPath: `${process.cwd()}/config/`,
	tables: [
		SessionTable,
		UserTable
	],
	throwIfNotAllowed: true,
	preMigration(migrations: PublicMigrations): SqlChanges | void {
		migrations.renameColumn(1, UserTable, "userName", "username");
	}
} satisfies DatabaseInstructions