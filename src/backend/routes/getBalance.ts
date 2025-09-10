import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import GetBalance from "../../shared/data/GetBalance.ts";
import {DbType} from "../database/setupDb.ts";
import getBlockchain from "../actions/getBlockchain.ts";


/**
 * Creates a GET route for creating a save random string of a given length
 */
export default function getBalance(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetBalance>("/getBalance", router, async (data) => {
		const blockchainAccountId = parseInt(data.blockchainAccountId ?? "0");
		
		const blockchainData = await db.selectFrom("BlockchainAccount")
			.select(["blockchainType", "publicKey"])
			.where("blockchainAccountId", "=", blockchainAccountId)
			.executeTakeFirst();
		
		if(!blockchainData) {
			throw new TranslatedException("errorFaultyData", "blockchainAccountId");
		}
		
		const blockchain = getBlockchain(blockchainData.blockchainType);
		const balance = await blockchain.getBalance(blockchainData.publicKey);
		
		return {
			balance: balance
		}
	});
	return router;
}


