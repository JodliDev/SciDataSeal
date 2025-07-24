import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions, PublicMigrations, SqlChanges} from "sqlmorpheus";
import Study, {StudyTable} from "./tables/Study.ts";
import DataLog, {DataLogTable} from "./tables/DataLog.ts";

export interface KyselyTables {
	User: User
	Session: Session
	Study: Study
	DataLog: DataLog
}
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 7,
	configPath: `${process.cwd()}/config`,
	tables: [
		SessionTable,
		UserTable,
		StudyTable,
		DataLogTable,
	],
	throwIfNotAllowed: true,
	preMigration(migrations: PublicMigrations): SqlChanges | void {
		migrations.renameColumn(1, UserTable, "userName", "username");
	}
} satisfies DatabaseInstructions