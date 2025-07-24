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
import {SetStudyColumnsGetInterface, SetStudyColumnsPostInterface} from "../../shared/data/SetStudyColumnsInterface.ts";

export default function setStudyColumns(db: DbType): express.Router {
	const router = express.Router();
	
	async function setColumns(studyId: number, pass: string, columns: string[]): Promise<void> {
		if(!isValidBackendString(pass))
			throw new FaultyDataException("apiPassword");
		
		if(!Array.isArray(columns))
			throw new FaultyDataException("columns");
		
		for(const column of columns) {
			if(!isValidBackendString(column))
				throw new FaultyDataException("column");
		}
		
		const columnsString = JSON.stringify(columns);
		
		const study = await db.selectFrom("Study")
			.select(["blockchainPrivateKey", "blockchainType", "columns"])
			.where("studyId", "=", studyId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(study?.columns == columnsString)
			return; //Already the same. We don't need to do anything.
		
		if(!study)
			throw new UnauthorizedException();
		
		const blockChain = getBlockchain(study.blockchainType);
		const signature = await blockChain.saveMessage(study.blockchainPrivateKey, columnsString, pass);
		
		await db.insertInto("DataLog")
			.values({
				studyId: studyId,
				signature: JSON.stringify(signature)
			})
			.execute();
		
		await db.updateTable("Study")
			.set({"columns": columnsString})
			.where("studyId", "=", studyId)
			.limit(1)
			.execute();
	}
	
	addPostRoute<SetStudyColumnsPostInterface>("/setStudyColumns", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const studyId = parseInt(query.id as string);
		
		if(!pass || !studyId || !data.columns)
			throw new MissingDataException();
		

		await setColumns(studyId, pass, data.columns);
		
		return {}
	});
	
	addGetRoute<SetStudyColumnsGetInterface>("/setStudyColumns", router, async (data, request) => {
		const pass = getAuthHeader(request) ?? data.pass;
		
		if(!data.id || !data.columns || !pass)
			throw new MissingDataException();
		
		await setColumns(parseInt(data.id), pass, JSON.parse(data.columns));
		
		return {};
	});
	return router;
}


