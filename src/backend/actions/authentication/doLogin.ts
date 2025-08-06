import {SESSION_MAX_AGE} from "../../../shared/definitions/Constants.ts";
import {Cookies} from "../../../shared/definitions/Cookies.ts";
import {DbType} from "../../database/setupDb.ts";
import express from "express";
import createNewSession from "./createNewSession.ts";

/**
 * Handles user login by creating a new session and setting the necessary cookies.
 *
 * @param db - The database connection.
 * @param response - The express response object used to set cookies.
 * @param userId - The id of the user logging in.
 */
export default async function doLogin(db: DbType, response: express.Response, userId: number): Promise<void> {
	const token = await createNewSession(db, userId);
	
	response.cookie(Cookies.sessionToken, token, {secure: true, httpOnly: true, maxAge: SESSION_MAX_AGE});
	response.cookie(Cookies.userId, userId, {secure: true, httpOnly: true, maxAge: SESSION_MAX_AGE});
}