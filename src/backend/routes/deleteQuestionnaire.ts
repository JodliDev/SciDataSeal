import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import DeleteInterface from "../../shared/data/DeleteInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST route for deleting a questionnaire.
 *
 * @param db - The database connection.
 * @throws TranslatedException if id is missing
 */
export default function deleteQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<DeleteInterface>("/deleteQuestionnaire", router, async (data) => {
		if(!data.id)
			throw new TranslatedException("errorMissingData");
		
		await db.deleteFrom("Questionnaire")
			.where("questionnaireId", "=", data.id)
			.limit(1)
			.execute();
		
		return {};
	});
	return router;
}


