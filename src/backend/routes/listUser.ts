import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListUserInterface from "../../shared/data/ListUserInterface.ts";

/**
 * Creates a GET route for retrieving a list of all users
 */
export default function listUser(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListUserInterface>("/listUser", router, async (_) => {
		const user = await db.selectFrom("User")
			.select(["userId", "username"])
			.orderBy("username")
			.execute();
		
		return {
			user: user
		}
	});
	return router;
}


