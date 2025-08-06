import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";

/**
 * Determines if the user is logged in.
 *
 * @param db - The database connection.
 * @param request - The request object that contains authentication details.
 * @return A promise that resolves to `true` if the user is logged in, otherwise `false`.
 */
export default async function isLoggedIn(db: DbType, request: AuthenticatedRequest): Promise<boolean> {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return !!request.isLoggedIn;
}