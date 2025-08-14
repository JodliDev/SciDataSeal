import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import SetUserInterface from "../../shared/data/SetUserInterface.ts";
import encryptPassword from "../actions/authentication/encryptPassword.ts";
import validateUserData from "../actions/validateUserData.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";


/**
 * Creates a POST route for creating a user or changing an existing one (if an id was provided)
 * When changing a user, password will only be changed if provided.
 *
 * @param db - The database connection.
 */
export default function setUser(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SetUserInterface>("/setUser", router, async (data, request) => {
		if(!data.username) {
			throw new TranslatedException("errorMissingData");
		}
		
		validateUserData(data.username, data.password);
		
		const existingUser = await db.selectFrom("User")
			.select("userId")
			.where("username", "=", data.username)
			.executeTakeFirst();
		
		if(existingUser && existingUser.userId != data.id) {
			throw new TranslatedException("errorUsernameAlreadyExists");
		}
		
		if(data.id) {
			const session = await getLoggedInSessionData(db, request);
			if(session.userId == data.id) {
				throw new TranslatedException("errorCannotChangeOwnUser");
			}
			const updateData: Record<string, unknown> = {
				username: data.username,
				isAdmin: data.isAdmin ?? false,
			}
			if(data.password) {
				updateData.password = await encryptPassword(data.password);
			}
			
			await db
				.updateTable("User")
				.set(updateData)
				.where("userId", "=", data.id)
				.executeTakeFirst();
			
			return {
				userId: data.id
			};
		}
		else {
			if(!data.password) {
				throw new TranslatedException("errorMissingData");
			}
			const insert = await db
				.insertInto("User")
				.values({
					username: data.username,
					password: await encryptPassword(data.password),
					isAdmin: data.isAdmin ?? false,
					lastLogin: 0
				})
				.executeTakeFirst();
			
			return {
				userId: Number(insert.insertId)
			};
		}
	});
	return router;
}


