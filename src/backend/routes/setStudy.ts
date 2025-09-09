import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import SetStudyInterface from "../../shared/data/SetStudyInterface.ts";

/**
 * Creates a POST route for creating a study or changing an existing one (if an id was provided)
 *
 * @param db - The database connection.
 */
export default function setStudy(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SetStudyInterface>("/setStudy", router, async (data, request) => {
		if(!data.studyName || !data.apiPassword || !data.dataKey || !data.blockchainAccountId)
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
					dataKey: data.dataKey,
					blockchainAccountId: data.blockchainAccountId
				})
				.where("studyId", "=", data.id)
				.where("userId", "=", session.userId)
				.execute();
			
			await db.updateTable("Questionnaire")
				.set({
					apiPassword: data.apiPassword,
					dataKey: data.dataKey,
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
					dataKey: data.dataKey,
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


