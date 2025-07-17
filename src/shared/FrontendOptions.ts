import {Options} from "../backend/Options.ts";
import {DbType} from "../backend/database/setupDb.ts";

export interface FrontendOptions {
	isInit: boolean;
	urlPath: string;
}

export let FrontendOptionsString = "";

export async function recreateOptionsString(db: DbType) {
	const userCount = await db.selectFrom("User").select(db.fn.countAll().as("count")).limit(1).executeTakeFirst();
	FrontendOptionsString = JSON.stringify(
		{
			isInit: !!(userCount?.count),
			urlPath: Options.urlPath
		} satisfies FrontendOptions
	);
}