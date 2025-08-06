import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";
import SessionData from "../../../shared/SessionData.ts";
import UnauthorizedException from "../../../shared/exceptions/UnauthorizedException.ts";

/**
 * Retrieves the session data for a given authenticated request.
 * Ensures that the request is authenticated if not already.
 *
 * @param db - The database connection.
 * @param request - The incoming authenticated request containing session details.
 * @return A promise that resolves to the session data object containing authentication and user information.
 */
export default async function getSessionData(db: DbType, request: AuthenticatedRequest): Promise<SessionData> {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return {
		wasAuthenticated: request.wasAuthenticated,
		isLoggedIn: request.isLoggedIn,
		userId: request.userId,
		isAdmin: request.isAdmin,
	} satisfies SessionData;
}

/**
 * Retrieves and returns the logged-in user's session data.
 * This method calls {@link getSessionData()} but also ensures that the session is authenticated and the user is logged in.
 * If authentication fails or the user is not logged in, an UnauthorizedException is thrown.
 *
 * @param db - The database connection.
 * @param request - The authenticated request object containing session information.
 * @return A promise that resolves to the complete session data of the logged-in user.
 * @throws {UnauthorizedException} If the user is not authenticated or not logged in.
 */
export async function getLoggedInSessionData(db: DbType, request: AuthenticatedRequest): Promise<Required<SessionData>> {
	const response = await getSessionData(db, request);
	if(!response.wasAuthenticated || !response.isLoggedIn || !response.userId)
		throw new UnauthorizedException();
	return response as Required<SessionData>;
}