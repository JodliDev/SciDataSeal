import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import {SaveDataGetInterface, SaveDataPostInterface} from "../../shared/data/SaveDataInterface.ts";
import getAuthHeader from "../actions/getAuthHeader.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import QuestionnaireHasNoColumnsException from "../../shared/exceptions/QuestionnaireHasNoColumnsException.ts";
import createCsvLine from "../actions/createCsvLine.ts";

export default function saveData(db: DbType): express.Router {
	const router = express.Router();
	
	async function saveData(questionnaireId: number, pass: string, data: Record<string, string>): Promise<void> {
		if(!isValidBackendString(pass))
			throw new FaultyDataException("apiPassword");
		
		if(typeof data !== "object")
			throw new FaultyDataException("data");
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.innerJoin("BlockchainAccount", "Questionnaire.blockchainAccountId", "BlockchainAccount.blockchainAccountId")
			.select(["blockchainType", "privateKey", "columns", "questionnaireId", "Questionnaire.userId as userId"])
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire)
			throw new UnauthorizedException();
		
		if(!questionnaire.columns)
			throw new QuestionnaireHasNoColumnsException();
		
		const dataArray: string[] = [];
		const columnObj = JSON.parse(`[${questionnaire.columns}]`);
		for(const column of columnObj) {
			dataArray.push(data.hasOwnProperty(column) ? data[column] : "");
		}
		if(!dataArray.length)
			throw new MissingDataException();
		
		const blockChain = getBlockchain(questionnaire.blockchainType);
		const signature = await blockChain.saveMessage(questionnaire.privateKey, questionnaire.questionnaireId, createCsvLine(dataArray), pass);
		
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
		
		if(!pass || !questionnaireId || !data)
			throw new MissingDataException();
		

		await saveData(questionnaireId, pass, data as Record<string, string>);
		
		return {}
	});
	
	addGetRoute<SaveDataGetInterface>("/saveData", router, async (data, request) => {
		const pass = getAuthHeader(request) ?? data.pass;
		
		if(!data.id || !data.data || !pass)
			throw new MissingDataException();
		
		await saveData(parseInt(data.id), pass, JSON.parse(data.data));
		
		return {};
	});
	return router;
}


