import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import getAuthHeader from "../actions/getAuthHeader.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {SetQuestionnaireColumnsGetInterface, SetQuestionnaireColumnsPostInterface} from "../../shared/data/SetQuestionnaireColumnsInterface.ts";

export default function setQuestionnaireColumns(db: DbType): express.Router {
	const router = express.Router();
	
	async function setColumns(questionnaireId: number, pass: string, columns: string[]): Promise<void> {
		if(!isValidBackendString(pass))
			throw new FaultyDataException("apiPassword");
		
		if(!Array.isArray(columns))
			throw new FaultyDataException("columns");
		
		for(const column of columns) {
			if(!isValidBackendString(column))
				throw new FaultyDataException("columns");
		}
		
		const columnsString = JSON.stringify(columns);
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.innerJoin("BlockchainAccount", "Questionnaire.blockchainAccountId", "BlockchainAccount.blockchainAccountId")
			.select(["blockchainType", "privateKey", "columns", "blockchainDenotation", "Questionnaire.userId as userId"])
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire)
			throw new UnauthorizedException();
		
		if(questionnaire.columns == columnsString)
			return; //Already the same. We don't need to do anything.
		
		const blockChain = getBlockchain(questionnaire.blockchainType);
		const signature = await blockChain.saveMessage(questionnaire.privateKey, questionnaire.blockchainDenotation, columnsString, pass);
		
		await db.insertInto("DataLog")
			.values({
				questionnaireId: questionnaireId,
				userId: questionnaire.userId,
				signature: JSON.stringify(signature)
			})
			.execute();
		
		await db.updateTable("Questionnaire")
			.set({"columns": columnsString})
			.where("questionnaireId", "=", questionnaireId)
			.limit(1)
			.execute();
	}
	
	addPostRoute<SetQuestionnaireColumnsPostInterface>("/setQuestionnaireColumns", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const questionnaireId = parseInt(query.id as string);
		
		if(!pass || !questionnaireId || !data.columns)
			throw new MissingDataException();
		

		await setColumns(questionnaireId, pass, data.columns);
		
		return {}
	});
	
	addGetRoute<SetQuestionnaireColumnsGetInterface>("/setQuestionnaireColumns", router, async (data, request) => {
		const pass = getAuthHeader(request) ?? data.pass;
		
		if(!data.id || !data.columns || !pass)
			throw new MissingDataException();
		
		await setColumns(parseInt(data.id), pass, JSON.parse(data.columns));
		
		return {};
	});
	return router;
}


