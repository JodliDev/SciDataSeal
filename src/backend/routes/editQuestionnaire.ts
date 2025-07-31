import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import EditQuestionnaireInterface from "../../shared/data/EditQuestionnaireInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";
import AlreadyExistsException from "../../shared/exceptions/AlreadyExistsException.ts";

export default function editQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<EditQuestionnaireInterface>("/editQuestionnaire", router, async (data, request) => {
		if(!data.questionnaireName || !data.blockchainAccountId || !data.blockchainDenotation || !data.dataKey || !data.apiPassword)
			throw new MissingDataException();
		
		if(!isValidBackendString(data.questionnaireName))
			throw new FaultyDataException("questionnaireName");
		
		const session = await getLoggedInSessionData(db, request);
		
		
		const account = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", data.blockchainAccountId)
			.where("userId", "=", session.userId)
			.limit(1)
			.executeTakeFirst();
		
		if(!account)
			throw new UnauthorizedException();
		
		if(data.questionnaireId) {
			await db.updateTable("Questionnaire")
				.set({
					questionnaireName: data.questionnaireName,
					blockchainAccountId: data.blockchainAccountId,
					apiPassword: data.apiPassword,
					dataKey: data.dataKey,
					blockchainDenotation: data.blockchainDenotation
				})
				.where("questionnaireId", "=", data.questionnaireId)
				.execute();
			return {
				questionnaireId: data.questionnaireId
			};
		}
		else {
			if(data.blockchainDenotation <= account.highestDenotation)
				throw new AlreadyExistsException("blockchainDenotation");
			
			await db.updateTable("BlockchainAccount")
				.set({highestDenotation: data.blockchainDenotation})
				.where("blockchainAccountId", "=", data.blockchainAccountId)
				.execute();
			
			const insert = await db
				.insertInto("Questionnaire")
				.values({
					userId: session.userId,
					questionnaireName: data.questionnaireName,
					blockchainAccountId: data.blockchainAccountId,
					apiPassword: data.apiPassword,
					dataKey: data.dataKey,
					columns: "",
					blockchainDenotation: data.blockchainDenotation
				})
				.executeTakeFirst();
			
			return {
				questionnaireId: Number(insert.insertId)
			};
		}
		
	});
	return router;
}


