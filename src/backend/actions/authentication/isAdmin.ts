import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";
import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";


/**
 * Determines if the user has admin privileges.
 *
 * @param db - The database connection.
 * @param request - The request object containing authentication details.
 * @return A promise that resolves to true if the user is an admin, otherwise false.
 */
export default async function isAdmin(db: DbType, request: AuthenticatedRequest): Promise<boolean> {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return !!request.isAdmin;
}