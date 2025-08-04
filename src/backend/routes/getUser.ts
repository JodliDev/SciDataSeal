import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import NotFoundException from "../../shared/exceptions/NotFoundException.ts";
import GetUserInterface from "../../shared/data/GetUserInterface.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";

export default function getUser(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetUserInterface>("/getUser", router, async (data) => {
		const userId = parseInt(data.userId ?? "0");
		if(!userId)
			throw new MissingDataException();
		
		const user = await db.selectFrom("User")
			.select(["username", "isAdmin"])
			.where("userId", "=", userId)
			.limit(1)
			.executeTakeFirst();
		
		if(!user)
			throw new NotFoundException();
		
		return {
			userId: userId,
			username: user.username,
			isAdmin: user.isAdmin,
		}
	});
	return router;
}


