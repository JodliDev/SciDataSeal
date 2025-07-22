import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions, PublicMigrations, SqlChanges} from "sqlmorpheus";
import Study, {StudyTable} from "./tables/Study.ts";

export interface KyselyTables {
	User: User
	Session: Session
	Study: Study
}
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 5,
	configPath: `${process.cwd()}/config/`,
	tables: [
		SessionTable,
		UserTable,
		StudyTable
	],
	throwIfNotAllowed: true,
	preMigration(migrations: PublicMigrations): SqlChanges | void {
		migrations.renameColumn(1, UserTable, "userName", "username");
	}
} satisfies DatabaseInstructions