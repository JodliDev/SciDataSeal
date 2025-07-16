import {AuthenticatedRequest} from "../AuthenticatedRequest.ts";
import {DbType} from "../database/setupDb.ts";

export default async function authenticateRequest(db: DbType, request: AuthenticatedRequest) {
	if(request.wasAuthenticated)
		return;
	
	const authHeader = request.headers.authorization;
	if(!authHeader)
		return;
	
	// Expect the header to be in the format: "Bearer <token>"
	const token = authHeader.substring(7);
	if(!token)
		return;
	
	const session = await db
		.selectFrom("Session")
		.select(["userId", "expires"])
		.where("token", "=", token)
		.where("expires", ">", Date.now())
		.limit(1)
		.executeTakeFirst();
	
	if(session) {
		request.isLoggedIn = true;
		request.userId = session.userId;
		request.wasAuthenticated = true;
	}
}