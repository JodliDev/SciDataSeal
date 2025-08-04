import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import EditQuestionnaireInterface from "../../shared/data/EditQuestionnaireInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

export default function editQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<EditQuestionnaireInterface>("/editQuestionnaire", router, async (data, request) => {
		if(!data.questionnaireName || !data.blockchainAccountId || !data.blockchainDenotation || !data.dataKey || !data.apiPassword)
			throw new TranslatedException("errorMissingData");
		
		if(!isValidBackendString(data.questionnaireName))
			throw new TranslatedException("errorFaultyData", "questionnaireName");
		
		const session = await getLoggedInSessionData(db, request);
		
		
		const account = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", data.blockchainAccountId)
			.where("userId", "=", session.userId)
			.limit(1)
			.executeTakeFirst();
		
		if(!account)
			throw new UnauthorizedException();
		
		if(data.id) {
			await db.updateTable("Questionnaire")
				.set({
					questionnaireName: data.questionnaireName,
					blockchainAccountId: data.blockchainAccountId,
					apiPassword: data.apiPassword,
					dataKey: data.dataKey,
					blockchainDenotation: data.blockchainDenotation
				})
				.where("questionnaireId", "=", data.id)
				.execute();
			return {
				questionnaireId: data.id
			};
		}
		else {
			if(data.blockchainDenotation <= account.highestDenotation)
				throw new TranslatedException("errorAlreadyExists","blockchainDenotation");
			
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


