import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import {ListQuestionnaireDataGetInterface, ListQuestionnaireDataPostInterface} from "../../shared/data/ListQuestionnaireDataInterface.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";

export default function listQuestionnaireData(): express.Router {
	const router = express.Router();
	
	async function getData(blockchainType: string, publicKey: string, denotation: number, dataKey: string): Promise<ListQuestionnaireDataPostInterface["Response"] & ListQuestionnaireDataGetInterface["Response"]> {
		const blockChain = getBlockchain(blockchainType);
		const lines = await blockChain.listData(publicKey, denotation, dataKey);
		
		const output: string[][] = [];
		for(const entry of lines) {
			try {
				output.push(JSON.parse(entry));
			}
			catch {
				output.push((entry as any));
			}
		}
		
		return {
			data: output
		}
	}
	
	addGetRoute<ListQuestionnaireDataGetInterface>("/listQuestionnaireData", router, async (data) => {
		const denotation = parseInt(data.denotation ?? "0");
		if(!data.blockchainType || !data.publicKey || !denotation || !data.dataKey)
			throw new MissingDataException();
		
		return getData(data.blockchainType, data.publicKey, denotation, data.dataKey);
	});
	
	
	addPostRoute<ListQuestionnaireDataPostInterface>("/listQuestionnaireData", router, async (data) => {
		if(!data.blockchainType || !data.publicKey || !data.denotation || !data.dataKey)
			throw new MissingDataException();
		
		return getData(data.blockchainType, data.publicKey, data.denotation, data.dataKey);
	});
	return router;
}


