import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import DeleteInterface from "../../shared/data/DeleteInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST route for deleting a blockchain account.
 *
 * @param db - The database connection.
 * @throws TranslatedException if id is missing or if there are questionnaires still connected to the blockchain account.
 */
export default function deleteBlockchainAccount(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<DeleteInterface>("/deleteBlockchainAccount", router, async (data) => {
		if(!data.id)
			throw new TranslatedException("errorMissingData");
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.where("userId", "=", data.id)
			.limit(1)
			.executeTakeFirst();
		
		if(questionnaire)
			throw new TranslatedException("errorMustDeleteAllQuestionnaires")
		
		await db.deleteFrom("Questionnaire")
			.where("questionnaireId", "=", data.id)
			.limit(1)
			.execute();
		
		return {};
	});
	return router;
}


