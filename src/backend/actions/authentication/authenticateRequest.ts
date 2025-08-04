import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import {Cookies} from "../../../shared/definitions/Cookies.ts";
import isValidBackendString from "../../../shared/actions/isValidBackendString.ts";

export default async function authenticateRequest(db: DbType, request: AuthenticatedRequest) {
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