import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GetNewDenotation from "../../shared/data/GetNewDenotation.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a GET route for retrieving an unused (=highest) denotation for a blockchain account
 */
export default function getNewDenotation(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetNewDenotation>("/getNewDenotation", router, async (data) => {
		const blockChainId = parseInt(data.blockchainAccountId ?? "0");
		if(!blockChainId) {
			throw new TranslatedException("errorMissingData");
		}
		
		const response = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", blockChainId)
			.limit(1)
			.executeTakeFirst();
		
		if(!response) {
			throw new TranslatedException("errorNotFound");
		}
		
		return {
			denotation: response.highestDenotation + 1
		}
	});
	return router;
}


