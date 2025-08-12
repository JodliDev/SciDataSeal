import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import getBlockchain from "../actions/getBlockchain.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import {SaveDataGetInterface, SaveDataPostInterface} from "../../shared/data/SaveDataInterface.ts";
import getAuthHeader from "../actions/authentication/getAuthHeader.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import createCsvLine from "../actions/createCsvLine.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST and a GET route for saving data to the blockchain
 */
export default function saveData(db: DbType): express.Router {
	const router = express.Router();
	
	async function saveData(questionnaireId: number, pass: string, data: Record<string, string>): Promise<void> {
		if(!isValidBackendString(pass)) {
			throw new TranslatedException("errorFaultyData", "apiPassword");
		}
		
		if(typeof data !== "object" || Array.isArray(data)) {
			throw new TranslatedException("errorFaultyData", "data");
		}
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.innerJoin("BlockchainAccount", "Questionnaire.blockchainAccountId", "BlockchainAccount.blockchainAccountId")
			.select(["blockchainType", "privateKey", "columns", "blockchainDenotation", "Questionnaire.userId as userId"])
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
			dataArray.push(data.hasOwnProperty(column) ? data[column] : "");
		}
		
		const blockChain = getBlockchain(questionnaire.blockchainType);
		const signature = await blockChain.saveMessage(questionnaire.privateKey, questionnaire.blockchainDenotation, createCsvLine(dataArray), false, pass);
		
		await db.insertInto("DataLog")
			.values({
				questionnaireId: questionnaireId,
				userId: questionnaire.userId,
				signature: JSON.stringify(signature),
			})
			.execute();
	}
	
	addPostRoute<SaveDataPostInterface>("/saveData", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const questionnaireId = parseInt(query.id as string);
		
		if(!pass || !questionnaireId || !data) {
			throw new TranslatedException("errorMissingData");
		}
		

		await saveData(questionnaireId, pass, data as Record<string, string>);
		
		return {}
	});
	
	addGetRoute<SaveDataGetInterface>("/saveData", router, async (data, request) => {
		const pass = getAuthHeader(request) ?? data.pass;
		const id = parseInt(data.id ?? "0");
		
		if(!id || !data.data || !pass) {
			throw new TranslatedException("errorMissingData");
		}
		
		await saveData(id, pass, JSON.parse(data.data));
		
		return {};
	});
	return router;
}


