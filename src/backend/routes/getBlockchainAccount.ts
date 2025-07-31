import express from "express";
import {DbType} from "../database/setupDb.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import NotFoundException from "../../shared/exceptions/NotFoundException.ts";
import GetBlockchainInterface from "../../shared/data/GetBlockchainInterface.ts";

export default function getBlockchainAccount(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetBlockchainInterface>("/getBlockchainAccount", router, async (data, request) => {
		const session = await getLoggedInSessionData(db, request);
		const accountId = parseInt(data.accountId ?? "0");
		
		const account = await db.selectFrom("BlockchainAccount")
			.select(["blockchainName", "blockchainType", "privateKey", "publicKey", "highestDenotation"])
			.where("userId", "=", session.userId)
			.where("blockchainAccountId", "=", accountId)
			.limit(1)
			.executeTakeFirst();
		
		if(!account)
			throw new NotFoundException();
		
		return {
			blockchainAccountId: accountId,
			blockchainName: account.blockchainName,
			blockchainType: account.blockchainType,
			privateKey: account.privateKey,
			publicKey: account.publicKey,
			highestDenotation: account.highestDenotation,
		}
	});
	return router;
}


