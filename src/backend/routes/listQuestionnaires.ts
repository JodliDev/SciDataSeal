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
	
	addGetRoute<ListQuestionnairesInterface>("/listQuestionnaires", router, async (data, request) => {
		const session = await getLoggedInSessionData(db, request);
		
		const studyId = parseInt(data.studyId ?? "0") ?? 0;
		
		const questionnaires = data.studyId === undefined
			? await db.selectFrom("Questionnaire")
				.select(["questionnaireId", "questionnaireName"])
				.where("userId", "=", session.userId)
				.orderBy("questionnaireName")
				.execute()
			: await db.selectFrom("Questionnaire")
				.select(["questionnaireId", "questionnaireName"])
				.where("studyId", "=", studyId)
				.where("userId", "=", session.userId)
				.orderBy("questionnaireName")
				.execute();
		
		return {
			questionnaires: questionnaires
		}
	});
	return router;
}


