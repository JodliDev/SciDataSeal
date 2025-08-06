import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListBlockchainAccountsInterface from "../../shared/data/ListBlockchainAccountsInterface.ts";

/**
 * Creates a GET route for retrieving a list of all blockchain accounts
 */
export default function listBlockchainAccounts(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListBlockchainAccountsInterface>("/listBlockchainAccounts", router, async (_) => {
		const accounts = await db.selectFrom("BlockchainAccount")
			.select(["blockchainAccountId", "blockchainName"])
			.orderBy("blockchainName")
			.execute();
		
		return {
			accounts: accounts
		}
	});
	return router;
}


