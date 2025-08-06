import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions, PublicMigrations, SqlChanges} from "sqlmorpheus";
import Questionnaire, {QuestionnaireTable} from "./tables/Questionnaire.ts";
import DataLog, {DataLogTable} from "./tables/DataLog.ts";
import BlockchainAccount, {BlockchainAccountTable} from "./tables/BlockchainAccount.ts";

/**
 * Used to bind Database tables to Kysely
 */
export interface KyselyTables {
	User: User
	Session: Session
	Questionnaire: Questionnaire
	BlockchainAccount: BlockchainAccount
	DataLog: DataLog
}

/**
 * Configuration for SqlMorpheus
 */
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 11,
	configPath: `${process.cwd()}/config`,
	tables: [
		UserTable,
		DataLogTable,
		SessionTable,
		BlockchainAccountTable,
		QuestionnaireTable,
	],
	throwIfNotAllowed: true,
	preMigration(migrations: PublicMigrations): SqlChanges | void {
		migrations.renameColumn(1, UserTable, "userName", "username");
		
		// migrations.allowMigration(9, SessionTable, "alterForeignKey");
		// migrations.allowMigration(9, SessionTable, "recreateTable");
		// migrations.allowMigration(9, StudyTable, "alterForeignKey");
		// migrations.allowMigration(9, StudyTable, "recreateTable");
		// migrations.allowMigration(9, DataLogTable, "alterForeignKey");
		// migrations.allowMigration(9, DataLogTable, "recreateTable");
		
	}
} satisfies DatabaseInstructions