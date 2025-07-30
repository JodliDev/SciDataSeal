import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListQuestionnaireDataInterface from "../../shared/data/ListQuestionnaireDataInterface.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";

export default function listQUestionnaireData(): express.Router {
	const router = express.Router();
	
	addGetRoute<ListQuestionnaireDataInterface>("/listQuestionnaireData", router, async (data) => {
		const denotation = parseInt(data.denotation ?? "0");
		if(!data.blockchainType || !data.publicKey || !denotation || !data.dataKey)
			throw new MissingDataException();
		
		const blockChain = getBlockchain(data.blockchainType);
		const lines = await blockChain.listData(data.publicKey, denotation, data.dataKey);
		
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
	});
	return router;
}


