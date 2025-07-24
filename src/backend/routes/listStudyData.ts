import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListStudyDataInterface from "../../shared/data/ListStudyDataInterface.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";

export default function listStudyData(): express.Router {
	const router = express.Router();
	
	addGetRoute<ListStudyDataInterface>("/listStudyData", router, async (data) => {
		if(!data.blockchainType || !data.publicKey || !data.dataKey)
			throw new MissingDataException();
		
		const blockChain = getBlockchain(data.blockchainType);
		const lines = await blockChain.listData(data.publicKey, data.dataKey);
		
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


