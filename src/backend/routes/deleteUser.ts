import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import DeleteInterface from "../../shared/data/DeleteInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST route for deleting a user.
 *
 * @param db - The database connection.
 * @throws TranslatedException if id is missing or user is the current session user
 */
export default function deleteUser(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<DeleteInterface>("/deleteUser", router, async (data, request) => {
		if(!data.id)
			throw new TranslatedException("errorMissingData");
		const session = await getLoggedInSessionData(db, request);
		if(session.userId == data.id)
			throw new TranslatedException("errorCannotDeleteYourself");
		await db.deleteFrom("User")
			.where("userId", "=", data.id)
			.limit(1)
			.execute();
		
		return {};
	});
	return router;
}


