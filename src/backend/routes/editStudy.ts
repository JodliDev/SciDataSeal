import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import EditStudyInterface from "../../shared/data/EditStudyInterface.ts";

/**
 * Creates a POST route for creating a study or changing an existing one (if an id was provided)
 *
 * @param db - The database connection.
 */
export default function editStudy(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<EditStudyInterface>("/editStudy", router, async (data, request) => {
		if(!data.studyName || !data.apiPassword || !data.blockchainAccountId)
			throw new TranslatedException("errorMissingData");
		
		if(!isValidBackendString(data.studyName)) {
			throw new TranslatedException("errorFaultyData", "studyName");
		}
		
		const session = await getLoggedInSessionData(db, request);
		
		if(data.id) {
			await db.updateTable("Study")
				.set({
					studyName: data.studyName,
					apiPassword: data.apiPassword,
					blockchainAccountId: data.blockchainAccountId
				})
				.where("studyId", "=", data.id)
				.where("userId", "=", session.userId)
				.execute();
			
			return {
				studyId: data.id
			};
		}
		else {
			const insert = await db
				.insertInto("Study")
				.values({
					userId: session.userId,
					studyName: data.studyName,
					apiPassword: data.apiPassword,
					blockchainAccountId: data.blockchainAccountId
				})
				.executeTakeFirst();
			
			return {
				studyId: Number(insert.insertId)
			};
		}
	});
	return router;
}


