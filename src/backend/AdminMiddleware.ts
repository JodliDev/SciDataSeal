import express, {NextFunction} from "express";
import {DbType} from "./database/setupDb.ts";
import createErrorResponse from "./actions/createErrorResponse.ts";
import isLoggedIn from "./actions/authentication/isLoggedIn.ts";
import UnauthorizedException from "../shared/exceptions/UnauthorizedException.ts";
import isAdmin from "./actions/authentication/isAdmin.ts";

/**
 * Middleware to verify if a user is logged in and has admin privileges before proceeding.
 *
 * @param db - The database instance used to verify user authentication and authorization.
 * @return A middleware function that checks for admin status and either proceeds or returns an error response.
 */
export default function AdminMiddleware(db: DbType): (request: express.Request, response: express.Response, next: NextFunction) => Promise<void> {
	return async (request: express.Request, response: express.Response, next: NextFunction) => {
		try {
			if(await isLoggedIn(db, request) && await isAdmin(db, request))
				next();
			else
				throw new UnauthorizedException();
		}
		catch(error) {
			createErrorResponse(error, response);
			return;
		}
	};
}