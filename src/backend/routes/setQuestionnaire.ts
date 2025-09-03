import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import SetQuestionnaireInterface from "../../shared/data/SetQuestionnaireInterface.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST route for creating a questionnaire or changing an existing one (if an id was provided)
 *
 * @param db - The database connection.
 */
export default function setQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SetQuestionnaireInterface>("/setQuestionnaire", router, async (data, request) => {
		if(!data.questionnaireName || !data.apiPassword || !data.studyId) {
			throw new TranslatedException("errorMissingData");
		}
		
		if(!isValidBackendString(data.questionnaireName)) {
			throw new TranslatedException("errorFaultyData", "questionnaireName");
		}
		
		const session = await getSessionData(db, request);
		
		const study = session.isLoggedIn
			? await db.selectFrom("Study")
				.select(["blockchainAccountId", "userId"])
				.where("studyId", "=", data.studyId)
				.where("userId", "=", session.userId!)
				.limit(1)
				.executeTakeFirst()
			: await db.selectFrom("Study")
				.select(["blockchainAccountId", "userId"])
				.where("studyId", "=", data.studyId)
				.where("apiPassword", "=", data.apiPassword)
				.limit(1)
				.executeTakeFirst()
		
		
		if(!study) {
			throw new TranslatedException("errorFaultyData", "studyId");
		}
		
		const blockchainAccountId = data.blockchainAccountId || study.blockchainAccountId;
		const dataKey = data.dataKey || data.apiPassword;
		
		
		const account = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", blockchainAccountId)
			.limit(1)
			.executeTakeFirst();
		
		
		if(!account) {
			throw new TranslatedException("errorFaultyData", "blockchainAccountId");
		}
		
		if(data.id) {
			const values: Record<string, unknown> = {
				questionnaireName: data.questionnaireName,
				blockchainAccountId: blockchainAccountId,
				apiPassword: data.apiPassword,
				dataKey: dataKey,
			};
			
			if(data.blockchainDenotation) {
				values.blockchainDenotation = data.blockchainDenotation;
			}
			
			await db.updateTable("Questionnaire")
				.set(values)
				.where("questionnaireId", "=", data.id)
				.execute();
			
			return {
				questionnaireId: data.id
			};
		}
		else {
			const blockchainDenotation = data.blockchainDenotation || account.highestDenotation + 1;
			
			if(blockchainDenotation <= account.highestDenotation) {
				throw new TranslatedException("errorAlreadyExists", "blockchainDenotation");
			}
			
			await db.updateTable("BlockchainAccount")
				.set({highestDenotation: blockchainDenotation})
				.where("blockchainAccountId", "=", blockchainAccountId)
				.execute();
			
			const insert = await db
				.insertInto("Questionnaire")
				.values({
					userId: study.userId,
					questionnaireName: data.questionnaireName,
					studyId: data.studyId,
					blockchainAccountId: blockchainAccountId,
					apiPassword: data.apiPassword,
					dataKey: dataKey,
					columns: "",
					blockchainDenotation: blockchainDenotation
				})
				.executeTakeFirst();
			
			return {
				questionnaireId: Number(insert.insertId)
			};
		}
		
	});
	return router;
}


