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

export default function saveData(db: DbType): express.Router {
	const router = express.Router();
	
	async function saveData(studyId: number, pass: string, data: Record<string, string>): Promise<void> {
		if(!isValidBackendString(pass))
			throw new FaultyDataException("apiPassword");
		
		if(typeof data !== "object")
			throw new FaultyDataException("data");
		
		const study = await db.selectFrom("Study")
			.select(["blockchainPrivateKey", "blockchainType", "columns"])
			.where("studyId", "=", studyId)
			.where("apiPassword", "=", pass)
			.limit(1)
			.executeTakeFirst();
		
		if(!study)
			throw new UnauthorizedException();
		
		if(!study.columns)
			throw new UnauthorizedException();
		
		const dataArray: string[] = [];
		const columnObj = JSON.parse(study.columns);
		for(const column of columnObj) {
			dataArray.push(data.hasOwnProperty(column) ? data[column] : "");
		}
		if(!dataArray.length)
			throw new MissingDataException();
		
		const blockChain = getBlockchain(study.blockchainType);
		const signature = await blockChain.saveMessage(study.blockchainPrivateKey, JSON.stringify(dataArray), pass);
		
		await db.insertInto("DataLog")
			.values({
				studyId: studyId,
				signature: JSON.stringify(signature)
			})
			.execute();
	}
	
	addPostRoute<SaveDataPostInterface>("/saveData", router, async (data, request) => {
		const query = request.query;
		const pass = getAuthHeader(request) ?? query.pass as string;
		const studyId = parseInt(query.id as string);
		
		if(!pass || !studyId || !data)
			throw new MissingDataException();
		

		await saveData(studyId, pass, data as Record<string, string>);
		
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


