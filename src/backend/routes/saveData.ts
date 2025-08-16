import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import getBlockchain from "../actions/getBlockchain.ts";
import {SaveDataInterface} from "../../shared/data/SaveDataInterface.ts";
import getAuthHeader from "../actions/authentication/getAuthHeader.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import createCsvLine from "../actions/createCsvLine.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST and a GET route for saving data to the blockchain
 */
export default function saveData(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SaveDataInterface>("/saveData", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const questionnaireId = parseInt(query.id as string);
		
		if(!pass || !questionnaireId || !data) {
			throw new TranslatedException("errorMissingData");
		}
		

		// await saveData(questionnaireId, pass, data as Record<string, string>);
		
		if(!isValidBackendString(pass)) {
			throw new TranslatedException("errorFaultyData", "apiPassword");
		}
		
		if(typeof data !== "object" || Array.isArray(data)) {
			throw new TranslatedException("errorFaultyData", "data");
		}
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.innerJoin("BlockchainAccount", "Questionnaire.blockchainAccountId", "BlockchainAccount.blockchainAccountId")
			.select(["privateKey", "columns", "Questionnaire.blockchainAccountId as blockchainAccountId", "blockchainType", "blockchainDenotation", "Questionnaire.userId as userId"])
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire) {
			throw new UnauthorizedException();
		}
		
		if(!questionnaire.columns) {
			throw new TranslatedException("errorQuestionnaireHasNoColumns");
		}
		
		const dataArray: string[] = [];
		const columnObj = JSON.parse(`[${questionnaire.columns}]`);
		for(const column of columnObj) {
			dataArray.push(data.hasOwnProperty(column) ? data[column] as string : "");
		}
		
		const blockChain = getBlockchain(questionnaire.blockchainType);
		const signature = await blockChain.saveMessage(questionnaire.privateKey, questionnaire.blockchainDenotation, createCsvLine(dataArray), false, pass);
		
		await db.insertInto("DataLog")
			.values({
				questionnaireId: questionnaireId,
				userId: questionnaire.userId,
				signature: JSON.stringify(signature),
				timestamp: Date.now(),
				blockchainAccountId: questionnaire.blockchainAccountId,
			})
			.execute();
		
		return {}
	});
	
	return router;
}


