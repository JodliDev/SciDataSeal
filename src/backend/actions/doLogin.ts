import {randomBytes} from "node:crypto";
import {SESSION_MAX_AGE} from "../../shared/definitions/Constants.ts";
import {Cookies} from "../../shared/definitions/Cookies.ts";
import {DbType} from "../database/setupDb.ts";
import express from "express";

export default async function doLogin(db: DbType, response: express.Response, userId: number) {
	const token = randomBytes(20).toString("hex");
	await db.insertInto("Session")
		.values(() => ({
			token: token,
			expires: Date.now() + SESSION_MAX_AGE,
			userId: userId
		}))
		.executeTakeFirst();
	
	response.cookie(Cookies.sessionToken, token, {secure: true, httpOnly: true, maxAge: SESSION_MAX_AGE});
	response.cookie(Cookies.userId, userId, {secure: true, httpOnly: true, maxAge: SESSION_MAX_AGE});
}