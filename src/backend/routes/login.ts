import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import LoginData from "../../shared/data/LoginData.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import bcrypt from "bcrypt";
import {addPostRoute} from "../actions/addRoutes.ts";
import doLogin from "../actions/doLogin.ts";

export default function login(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<LoginData>("/login", router, async (data, request, response) => {
		if(!data.username || !data.password)
			throw new MissingDataException();
		
		const user = await db
			.selectFrom("User")
			.select(["password", "userId"])
			.where("name", "=", data.username)
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


