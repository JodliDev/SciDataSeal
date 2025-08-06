import {DbType} from "../database/setupDb.ts";
import {Options} from "../Options.ts";
import {FrontendOptions} from "../../shared/FrontendOptions.ts";

export let FrontendOptionsString = "";

/**
 * Caches the options for the frontend into a JSON string.
 * Sets isInit to false if no user exists in the database
 *
 * @param db - The database instance used for querying data.
 */
export async function recreateOptionsString(db: DbType): Promise<void> {
	const userCount = await db.selectFrom("User").select(db.fn.countAll().as("count")).limit(1).executeTakeFirst();
	FrontendOptionsString = JSON.stringify(
		{
			isInit: !!(userCount?.count),
			urlPath: Options.urlPath
		} satisfies FrontendOptions
	);
}