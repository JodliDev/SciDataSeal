import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import LoginInterface from "../../shared/data/LoginInterface.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import bcrypt from "bcrypt";
import doLogin from "../actions/authentication/doLogin.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";

export default function login(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<LoginInterface>("/login", router, async (data, request, response) => {
		if(!data.username || !data.password)
			throw new MissingDataException();
		if(isValidBackendString(data.username))
			throw new FaultyDataException("username");
		
		const user = await db
			.selectFrom("User")
			.select(["password", "userId"])
			.where("username", "=", data.username)
			.limit(1)
			.executeTakeFirst();
		
		if(!user)
			throw new UnauthorizedException();
		if(!await bcrypt.compare(data.password, user.password))
			throw new UnauthorizedException();
		
		
		await doLogin(db, response, user.userId);
		
		return {
			userId: user.userId
		};
	});
	return router;
}


