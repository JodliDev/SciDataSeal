import express, {NextFunction} from "express";
import {DbType} from "./database/setupDb.ts";
import createErrorResponse from "./actions/createErrorResponse.ts";
import isLoggedIn from "./actions/isLoggedIn.ts";
import UnauthorizedException from "../shared/exceptions/UnauthorizedException.ts";

export default function AuthenticateMiddleware(db: DbType): (request: express.Request, response: express.Response, next: NextFunction) => Promise<void> {
	return async (request: express.Request, response: express.Response, next: NextFunction) => {
		try {
			if(await isLoggedIn(db, request))
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