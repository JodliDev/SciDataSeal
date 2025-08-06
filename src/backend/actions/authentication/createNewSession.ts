import {SESSION_MAX_AGE} from "../../../shared/definitions/Constants.ts";
import {DbType} from "../../database/setupDb.ts";
import {randomBytes} from "node:crypto";

/**
 * Creates a new session for the specified user and stores it in the database.
 *
 * @param db - The database connection.
 * @param userId - The id of the user for whom the session is being created.
 * @return A promise that resolves to the generated session token.
 */
export default async function createNewSession(db: DbType, userId: number): Promise<string> {
	const token = randomBytes(32).toString("hex");
	await db.insertInto("Session")
		.values({
			token: token,
			expires: Date.now() + SESSION_MAX_AGE,
			userId: userId
		})
		.execute();
	
	return token;
}