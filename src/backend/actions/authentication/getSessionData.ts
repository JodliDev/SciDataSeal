import {AuthenticatedRequest} from "../../AuthenticatedRequest.ts";
import {DbType} from "../../database/setupDb.ts";
import authenticateRequest from "./authenticateRequest.ts";
import SessionData from "../../../shared/SessionData.ts";
import UnauthorizedException from "../../../shared/exceptions/UnauthorizedException.ts";

export default async function getSessionData(db: DbType, request: AuthenticatedRequest): Promise<SessionData> {
	if(!request.wasAuthenticated)
		await authenticateRequest(db, request);
	return {
		wasAuthenticated: request.wasAuthenticated,
		isLoggedIn: request.isLoggedIn,
		userId: request.userId
	} satisfies SessionData;
}

export async function getLoggedInSessionData(db: DbType, request: AuthenticatedRequest): Promise<Required<SessionData>> {
	const response = await getSessionData(db, request);
	if(!response.wasAuthenticated || !response.isLoggedIn || !response.userId)
		throw new UnauthorizedException();
	return response as Required<SessionData>;
}