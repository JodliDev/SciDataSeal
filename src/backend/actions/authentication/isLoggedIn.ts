import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";

export default async function isLoggedIn(db: DbType, request: AuthenticatedRequest) {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return request.isLoggedIn;
}