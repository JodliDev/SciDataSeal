import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import {GetQuestionnaireDataGetInterface, GetQuestionnaireDataPostInterface} from "../../shared/data/GetQuestionnaireDataInterface.ts";
import getBlockchain from "../actions/getBlockchain.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {SEPARATOR} from "../../shared/definitions/Constants.ts";

/**
 * Creates a GET and a POST route for retrieving questionnaire data as a CSV
 */
export default function getQuestionnaireData(): express.Router {
	const router = express.Router();
	
	async function getData(blockchainType: string, publicKey: string, denotation: number, dataKey: string): Promise<GetQuestionnaireDataPostInterface["Response"] & GetQuestionnaireDataGetInterface["Response"]> {
		const blockChain = getBlockchain(blockchainType);
		const lines = await blockChain.listData(publicKey, denotation, dataKey);
		
		const output: string[] = [];
		for(const entry of lines) {
			const content = `${entry.isHeader ? "\"Time\"" : `"${entry.timestamp}"`}${SEPARATOR}${entry.data}`;
			output.push(content);
		}
		
		return {
			csv: output.join("\n"),
		}
	}
	
	addGetRoute<GetQuestionnaireDataGetInterface>("/getQuestionnaireData", router, async (data) => {
		const denotation = parseInt(data.denotation ?? "0");
		if(!data.blockchainType || !data.publicKey || !denotation || !data.dataKey)
			throw new TranslatedException("errorMissingData");
		
		return getData(data.blockchainType, data.publicKey, denotation, data.dataKey);
	});
	
	
	addPostRoute<GetQuestionnaireDataPostInterface>("/getQuestionnaireData", router, async (data) => {
		if(!data.blockchainType || !data.publicKey || !data.denotation || !data.dataKey)
			throw new TranslatedException("errorMissingData");
		
		return getData(data.blockchainType, data.publicKey, data.denotation, data.dataKey);
	});
	return router;
}


