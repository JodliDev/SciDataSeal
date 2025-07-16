import {Kysely, SqliteDialect} from "kysely";
import SQLite from "better-sqlite3";
import {Options} from "../Options.ts";
import {CONFIG_FOLDER, SQLITE_FILE_NAME} from "../../shared/Constants.ts";
import {prepareAndRunMigration} from "sqlmorpheus";
import {KyselyTables, SqlMorpheusConfig} from "./DatabaseConfigs.ts";

export default async function setupDb(): Promise<Kysely<KyselyTables>> {
	const path = `${Options.root}/${CONFIG_FOLDER}/${SQLITE_FILE_NAME}`;
	console.log(`Using database at ${path}`);
	const db = new SQLite(path);
	
	await prepareAndRunMigration({
		runGetStatement: (query: string) => {
			return Promise.resolve(db.prepare(query).all());
		},
		runMultipleWriteStatements: (query: string) => {
			const transaction = db.transaction(() => {
				db.exec(query);
			});
			transaction();

			return Promise.resolve();
		}
	}, SqlMorpheusConfig);
	
	const dialect = new SqliteDialect({
		database: db,
	});
	return new Kysely<KyselyTables>({
		dialect,
	});
}

export type DbType = Kysely<KyselyTables>;