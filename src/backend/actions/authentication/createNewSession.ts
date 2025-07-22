import {SESSION_MAX_AGE} from "../../../shared/definitions/Constants.ts";
import {DbType} from "../../database/setupDb.ts";
import {randomBytes} from "node:crypto";

export default async function createNewSession(db: DbType, userId: number): Promise<string> {
	const token = randomBytes(20).toString("hex");
	await db.insertInto("Session")
		.values(() => ({
			token: token,
			expires: Date.now() + SESSION_MAX_AGE,
			userId: userId
		}))
		.execute();
	
	return token;
}