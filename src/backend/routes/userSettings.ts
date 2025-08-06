import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import UserSettingsInterface from "../../shared/data/UserSettingsInterface.ts";
import encryptPassword from "../actions/authentication/encryptPassword.ts";

export default function userSettings(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<UserSettingsInterface>("/userSettings", router, async (data, request) => {
		if(!data.newPassword)
			throw new TranslatedException("errorMissingData");
		
		
		const session = await getLoggedInSessionData(db, request);
		
		await db
			.updateTable("User")
			.set({
				password: await encryptPassword(data.newPassword)
			})
			.where("userId", "=", session.userId)
			.executeTakeFirst();
		
		return {};
	});
	return router;
}


