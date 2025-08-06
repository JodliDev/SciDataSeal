import express from "express";
import {DbType} from "../database/setupDb.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListQuestionnairesInterface from "../../shared/data/ListQuestionnairesInterface.ts";

/**
 * Creates a GET route for retrieving a list of questionnaires for the current user
 */
export default function listQuestionnaires(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListQuestionnairesInterface>("/listQuestionnaires", router, async (_, request) => {
		const session = await getLoggedInSessionData(db, request);
		
		const questionnaires = await db.selectFrom("Questionnaire")
			.select(["questionnaireId", "questionnaireName"])
			.where("userId", "=", session.userId)
			.orderBy("questionnaireName")
			.execute();
		
		return {
			questionnaires: questionnaires
		}
	});
	return router;
}


