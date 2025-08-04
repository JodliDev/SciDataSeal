import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";
import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";

export default async function isAdmin(db: DbType, request: AuthenticatedRequest) {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return request.isAdmin;
}