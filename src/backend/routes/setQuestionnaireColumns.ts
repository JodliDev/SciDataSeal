import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import getAuthHeader from "../actions/authentication/getAuthHeader.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {SetQuestionnaireColumnsInterface} from "../../shared/data/SetQuestionnaireColumnsInterface.ts";
import createCsvLine from "../actions/createCsvLine.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {compressAndEncrypt} from "../actions/compressAndEncrypt.ts";


/**
 * Creates a POST and a GET route for updating the questionnaire header columns
 */
export default function setQuestionnaireColumns(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SetQuestionnaireColumnsInterface>("/setQuestionnaireColumns", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const questionnaireId = parseInt(query.id as string);
		const columns = data.columns;
		
		if(!pass || !questionnaireId || !columns) {
			throw new TranslatedException("errorMissingData");
		}
		
		if(!isValidBackendString(pass)) {
			throw new TranslatedException("errorFaultyData", "apiPassword");
		}
		
		if(!Array.isArray(columns)) {
			throw new TranslatedException("errorFaultyData", "columns");
		}
		
		for(const column of columns) {
			if(!isValidBackendString(column)) {
				throw new TranslatedException("errorFaultyData", "columns");
			}
		}
		
		const columnsCsv = createCsvLine(columns);
		const columnsJson = JSON.stringify(columns);
		
		const questionnaire = await db.selectFrom("Questionnaire")
			.select(["columns", "blockchainAccountId", "userId", "dataKey"])
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(!questionnaire) {
			throw new UnauthorizedException();
		}
		
		if(questionnaire.columns == columnsJson) {
			return; //Already the same. We don't need to do anything.
		}
		
		const message = compressAndEncrypt(columnsCsv, questionnaire.dataKey);
		
		await db.insertInto("DataLog")
			.values({
				questionnaireId: questionnaireId,
				userId: questionnaire.userId,
				signatures: "",
				timestamp: Date.now(),
				blockchainAccountId: questionnaire.blockchainAccountId,
				data: message,
				isHeader: true,
				wasSent: false,
				wasConfirmed: false
			})
			.execute();
		
		await db.updateTable("Questionnaire")
			.set({columns: columnsJson})
			.where("questionnaireId", "=", questionnaireId)
			.limit(1)
			.execute();
		
		return {}
	});
	
	return router;
}


