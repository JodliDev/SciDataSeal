import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import bcrypt from "bcrypt";
import {PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH} from "../../shared/definitions/Constants.ts";
import InitializeInterface from "../../shared/data/InitializeInterface.ts";
import {Options} from "../Options.ts";
import doLogin from "../actions/authentication/doLogin.ts";
import TooShortException from "../../shared/exceptions/TooShortException.ts";
import {recreateOptionsString} from "../../shared/FrontendOptions.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";

export default function initialize(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<InitializeInterface>("/initialize", router, async (data, request, response) => {
		if(Options.isInit)
			throw new UnauthorizedException();
		
		if(!data.username || !data.password)
			throw new MissingDataException();
		if(data.username.length < USERNAME_MIN_LENGTH)
			throw new TooShortException("username", USERNAME_MIN_LENGTH);
		if(data.password.length < PASSWORD_MIN_LENGTH)
			throw new TooShortException("password", PASSWORD_MIN_LENGTH);
		if(isValidBackendString(data.username))
			throw new FaultyDataException("username");
		
		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(data.password, salt);
		
		const insert = await db.insertInto("User")
			.values(() => ({
				password: hash,
				username: data.username!,
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


