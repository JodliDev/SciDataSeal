import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import bcrypt from "bcrypt";
import {PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH} from "../../shared/definitions/Constants.ts";
import {addPostRoute} from "../actions/addRoutes.ts";
import Initialize from "../../shared/data/Initialize.ts";
import {Options} from "../Options.ts";
import doLogin from "../actions/doLogin.ts";
import TooShortException from "../../shared/exceptions/TooShortException.ts";
import {recreateOptionsString} from "../../shared/FrontendOptions.ts";

export default function initialize(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<Initialize>("/initialize", router, async (data, request, response) => {
		if(Options.isInit)
			throw new UnauthorizedException();
		
		if(!data.username || !data.password)
			throw new MissingDataException();
		if(data.username.length < USERNAME_MIN_LENGTH)
			throw new TooShortException("username", USERNAME_MIN_LENGTH);
		if(data.password.length < PASSWORD_MIN_LENGTH)
			throw new TooShortException("password", PASSWORD_MIN_LENGTH);
		
		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(data.password, salt);
		
		const insert = await db.insertInto("User")
			.values(() => ({
				password: hash,
				name: data.username!,
				lastLogin: Date.now()
			})).executeTakeFirst();
		
		const userId = Number(insert.insertId!);
		await doLogin(db, response, userId);
		await recreateOptionsString(db);
		
		return {
			userId: userId
		};
	});
	return router;
}


