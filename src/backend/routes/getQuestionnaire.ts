import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GetQuestionnaireInterface from "../../shared/data/GetQuestionnaireInterface.ts";
import NotFoundException from "../../shared/exceptions/NotFoundException.ts";

export default function getQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetQuestionnaireInterface>("/getQuestionnaire", router, async (data, request) => {
		const session = await getSessionData(db, request);
		const questionnaireId = parseInt(data.questionnaireId ?? "0");
		
		if(!session.userId)
			throw new UnauthorizedException();
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.select(["questionnaireId", "questionnaireName", "blockchainDenotation", "blockchainAccountId", "apiPassword", "dataKey", "columns"])
			.where("userId", "=", session.userId)
			.where("questionnaireId", "=", questionnaireId)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire)
			throw new NotFoundException();
		
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


