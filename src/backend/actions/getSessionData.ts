import {AuthenticatedRequest} from "../AuthenticatedRequest.ts";
import {DbType} from "../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";
import SessionData from "../../shared/SessionData.ts";

export default async function getSessionData(db: DbType, request: AuthenticatedRequest): Promise<SessionData> {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return {
		wasAuthenticated: request.wasAuthenticated,
		isLoggedIn: request.isLoggedIn,
		userId: request.userId
	} satisfies SessionData;
}