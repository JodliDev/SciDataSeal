import {
	Kysely,
	KyselyPlugin,
	OperationNodeTransformer,
	PluginTransformQueryArgs,
	PluginTransformResultArgs,
	PrimitiveValueListNode,
	QueryResult,
	RootOperationNode,
	SqliteDialect,
	UnknownRow,
	ValueNode
} from "kysely";
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
		plugins: [new SqliteBooleanPlugin()]
	});
}

//Thanks to https://github.com/kysely-org/kysely/issues/123#issuecomment-2932307221

/**
 * A Kysely plugin designed to handle SQLite-specific transformation of boolean values within queries and results.
 * Uses {@link SqliteBooleanTransformer}
 * @see https://github.com/kysely-org/kysely/issues/123#issuecomment-2932307221
 */
export class SqliteBooleanPlugin implements KyselyPlugin {
	readonly #transformer = new SqliteBooleanTransformer();
	
	transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
		return this.#transformer.transformNode(args.node);
	}
	
	transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
		return Promise.resolve(args.result);
	}
}

/**
 * A transformer class that extends `OperationNodeTransformer` to handle the serialization
 * of boolean values for SQLite. This class primarily modifies how boolean values are
 * represented within SQL operations, ensuring they are converted to SQLite-compatible
 * integer representations (1 or 0).
 *
 * Used by {@link SqliteBooleanPlugin}
 * @see https://github.com/kysely-org/kysely/issues/123#issuecomment-2932307221
 */
class SqliteBooleanTransformer extends OperationNodeTransformer {
	override transformValue(node: ValueNode): ValueNode {
		return {
			...super.transformValue(node),
			value: this.serialize(node.value),
		};
	}
	
	transformPrimitiveValueList(node: PrimitiveValueListNode): PrimitiveValueListNode {
		return {
			...super.transformPrimitiveValueList(node),
			values: node.values.map(value => this.serialize(value)),
		};
	}
	
	private serialize(value: unknown) {
		return typeof value === "boolean" ? (value ? 1 : 0) : value;
	}
}

export type DbType = Kysely<KyselyTables>;