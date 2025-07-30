import {Kysely, SqliteDialect} from "kysely";
import SQLite from "better-sqlite3";
import {Options} from "../Options.ts";
import {CONFIG_FOLDER, SQLITE_FILE_NAME} from "../../shared/definitions/Constants.ts";
import {DatabaseAccess, prepareAndRunMigration, runMigrationWithoutHistory} from "sqlmorpheus";
import {KyselyTables, SqlMorpheusConfig} from "./DatabaseConfigs.ts";

/**
 * Sets up the database connection, performs migrations, and returns a database instance.
 * Parameters are only used in testing.
 *
 * @param path The file path to the SQLite database.
 * @param silentMigration If true, runs the migration process without creating any sql files.
 * @return A promise that resolves with the configured database instance.
 */
export default async function setupDb(path: string = `${Options.root}/${CONFIG_FOLDER}/${SQLITE_FILE_NAME}`, silentMigration?: boolean): Promise<DbType> {
	console.log(`Using database at ${path}`);
	const db = new SQLite(path);
	
	const dbAccess: DatabaseAccess = {
		runGetStatement: (query: string) => {
			return Promise.resolve(db.prepare(query).all());
		},
		runMultipleWriteStatements: (query: string) => {
			const transaction = db.transaction(() => {
				db.exec(query);
			});
			transaction();
			
			return Promise.resolve();
		},
		async createBackup(backupName: string): Promise<void> {
			const backupPath = `${Options.root}/${CONFIG_FOLDER}/${backupName}.sqlite`;
			await db.backup(backupPath);
		}
	}
	
	if(!silentMigration)
		await prepareAndRunMigration(dbAccess, SqlMorpheusConfig, true);
	else
		await runMigrationWithoutHistory(dbAccess, SqlMorpheusConfig);
	
	const dialect = new SqliteDialect({
		database: db,
	});
	return new Kysely<KyselyTables>({
		dialect,
	});
}

export type DbType = Kysely<KyselyTables>;