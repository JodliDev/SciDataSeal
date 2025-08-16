import User, {UserTable} from "./tables/User.ts";
import Session, {SessionTable} from "./tables/Session.ts";
import {DatabaseInstructions, PublicMigrations, SqlChanges} from "sqlmorpheus";
import Questionnaire, {QuestionnaireTable} from "./tables/Questionnaire.ts";
import DataLog, {DataLogTable} from "./tables/DataLog.ts";
import BlockchainAccount, {BlockchainAccountTable} from "./tables/BlockchainAccount.ts";
import Study, {StudyTable} from "./tables/Study.ts";

/**
 * Used to bind Database tables to Kysely
 */
export interface KyselyTables {
	User: User
	Session: Session
	Study: Study
	Questionnaire: Questionnaire
	BlockchainAccount: BlockchainAccount
	DataLog: DataLog
}

/**
 * Configuration for SqlMorpheus
 */
export const SqlMorpheusConfig = {
	dialect: "Sqlite",
	version: 18,
	configPath: `${process.cwd()}/config`,
	tables: [
		UserTable,
		DataLogTable,
		SessionTable,
		BlockchainAccountTable,
		StudyTable,
		QuestionnaireTable,
	],
	throwIfNotAllowed: true,
	preMigration(_: PublicMigrations): SqlChanges | void {
	
	},
} satisfies DatabaseInstructions