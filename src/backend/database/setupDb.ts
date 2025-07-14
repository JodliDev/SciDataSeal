import {Kysely, SqliteDialect} from "kysely";
import SQLite from "better-sqlite3";
import {Options} from "../Options.ts";
import {CONFIG_FOLDER, SQLITE_FILE_NAME} from "../../shared/Constants.ts";
import DatabaseInstructions from "./DatabaseInstructions.ts";

export default function setupDb(): Kysely<DatabaseInstructions> {
	const path = `${Options.root}/${CONFIG_FOLDER}/${SQLITE_FILE_NAME}`;
	console.log(`Using database at ${path}`);
	
	const dialect = new SqliteDialect({
		database: new SQLite(path),
	});
	return new Kysely<DatabaseInstructions>({
		dialect,
	});
}

export type DbType = Kysely<DatabaseInstructions>;