import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListUsersInterface from "../../shared/data/ListUsersInterface.ts";

/**
 * Creates a GET route for retrieving a list of all users
 */
export default function listUsers(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListUsersInterface>("/listUsers", router, async (_) => {
		const users = await db.selectFrom("User")
			.select(["userId", "username"])
			.orderBy("username")
			.execute();
		
		return {
			users: users
		}
	});
	return router;
}


