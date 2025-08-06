import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import {Cookies} from "../../../shared/definitions/Cookies.ts";
import isValidBackendString from "../../../shared/actions/isValidBackendString.ts";

/**
 * Authenticates an incoming request by validating session information stored in cookies
 * and updating the request object if the session is valid.
 *
 * @param db - The database connection.
 * @param request - The request object containing cookies and authentication state.
 */
export default async function authenticateRequest(db: DbType, request: AuthenticatedRequest): Promise<void> {
	if(request.wasAuthenticated)
		return;
	
	const sessionToken = request.cookies[Cookies.sessionToken];
	const userId = parseInt(request.cookies[Cookies.userId]);
	
	if(!sessionToken || !userId || !isValidBackendString(sessionToken))
		return;
	
	const session = await db
		.selectFrom("Session")
		.innerJoin("User", "User.userId", "Session.userId")
		.select(["Session.userId", "expires", "isAdmin"])
		.where("Session.userId", "=", userId)
		.where("token", "=", sessionToken)
		.where("expires", ">", Date.now())
		.limit(1)
		.executeTakeFirst();
	
	if(session) {
		request.isLoggedIn = true;
		request.userId = session.userId;
		request.isAdmin = session.isAdmin;
		request.wasAuthenticated = true;
	}
}