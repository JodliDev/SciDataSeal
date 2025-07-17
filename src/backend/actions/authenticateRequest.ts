import {AuthenticatedRequest} from "../AuthenticatedRequest.ts";
import {DbType} from "../database/setupDb.ts";
import {Cookies} from "../../shared/definitions/Cookies.ts";

export default async function authenticateRequest(db: DbType, request: AuthenticatedRequest) {
	if(request.wasAuthenticated)
		return;
	
	const sessionToken = request.cookies[Cookies.sessionToken];
	const userId = request.cookies[Cookies.userId];
	
	if(!sessionToken || !userId)
		return;
	
	const session = await db
		.selectFrom("Session")
		.select(["userId", "expires"])
		.where("userId", "=", userId)
		.where("token", "=", sessionToken)
		.where("expires", ">", Date.now())
		.limit(1)
		.executeTakeFirst();
	
	if(session) {
		request.isLoggedIn = true;
		request.userId = session.userId;
		request.wasAuthenticated = true;
	}
}