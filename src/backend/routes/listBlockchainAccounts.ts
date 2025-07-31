import express from "express";
import {DbType} from "../database/setupDb.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListBlockchainAccountsInterface from "../../shared/data/ListBlockchainAccountsInterface.ts";

export default function listBlockchainAccounts(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListBlockchainAccountsInterface>("/listBlockchainAccounts", router, async (_, request) => {
		const session = await getLoggedInSessionData(db, request);
		
		const accounts = await db.selectFrom("BlockchainAccount")
			.select(["blockchainAccountId", "blockchainName"])
			.where("userId", "=", session.userId)
			.orderBy("blockchainName")
			.execute();
		
		return {
			accounts: accounts
		}
	});
	return router;
}


