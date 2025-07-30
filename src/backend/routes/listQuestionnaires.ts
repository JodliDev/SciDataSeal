import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListQuestionnairesInterface from "../../shared/data/ListQuestionnairesInterface.ts";

export default function listQuestionnaires(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListQuestionnairesInterface>("/listQuestionnaires", router, async (_, request) => {
		
		const session = await getSessionData(db, request);
		
		if(!session.userId)
			throw new UnauthorizedException();
		
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


