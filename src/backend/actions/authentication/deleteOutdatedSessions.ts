import {DbType} from "../../database/setupDb.ts";

/**
 * Deletes outdated sessions from the database. This method removes all sessions where the expiration date
 * is earlier than the current date and time.
 *
 * @param db - The database connection.
 */
export default async function deleteOutdatedSessions(db: DbType): Promise<void> {
	await db.deleteFrom("Session").where("expires", "<", Date.now()).executeTakeFirst()
}