import {DbType} from "../../database/setupDb.ts";

export default async function deleteOutdatedSessions(db: DbType): Promise<void> {
	await db.deleteFrom("Session").where("expires", "<", Date.now()).executeTakeFirst()
}