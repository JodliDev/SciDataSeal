import express from "express";
import {DbType} from "../database/setupDb.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GetQuestionnaireInterface from "../../shared/data/GetQuestionnaireInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a GET route for retrieving a questionnaire
 */
export default function getQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetQuestionnaireInterface>("/getQuestionnaire", router, async (data, request) => {
		const session = await getLoggedInSessionData(db, request);
		const questionnaireId = parseInt(data.questionnaireId ?? "0");
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.select(["questionnaireId", "questionnaireName", "blockchainDenotation", "blockchainAccountId", "apiPassword", "dataKey", "columns"])
			.where("userId", "=", session.userId)
			.where("questionnaireId", "=", questionnaireId)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire)
			throw new TranslatedException("errorNotFound");
		
		return {
			questionnaireId: questionnaire.questionnaireId,
			questionnaireName: questionnaire.questionnaireName,
			blockchainDenotation: questionnaire.blockchainDenotation,
			blockchainAccountId: questionnaire.blockchainAccountId,
			apiPassword: questionnaire.apiPassword,
			dataKey: questionnaire.dataKey,
			columns: questionnaire.columns
		}
	});
	return router;
}


