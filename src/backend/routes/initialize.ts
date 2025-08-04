import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import InitializeInterface from "../../shared/data/InitializeInterface.ts";
import {Options} from "../Options.ts";
import doLogin from "../actions/authentication/doLogin.ts";
import {recreateOptionsString} from "../../shared/FrontendOptions.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import encryptPassword from "../actions/authentication/encryptPassword.ts";
import validateUserData from "../actions/authentication/validateUserData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

export default function initialize(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<InitializeInterface>("/initialize", router, async (data, request, response) => {
		if(Options.isInit)
			throw new UnauthorizedException();
		
		if(!data.username || !data.password)
			throw new TranslatedException("errorMissingData");
		validateUserData(data.username, data.password);
		
		const insert = await db.insertInto("User")
			.values({
				password: await encryptPassword(data.password),
				username: data.username!,
				lastLogin: Date.now(),
				isAdmin: true
			}).executeTakeFirst();
		
		const userId = Number(insert.insertId!);
		await doLogin(db, response, userId);
		await recreateOptionsString(db);
		
		return {
			userId: userId
		};
	});
	return router;
}


