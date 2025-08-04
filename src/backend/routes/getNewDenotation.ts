import express from "express";
import {DbType} from "../database/setupDb.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GetNewDenotation from "../../shared/data/GetNewDenotation.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

export default function getNewDenotation(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetNewDenotation>("/getNewDenotation", router, async (data, request) => {
		const blockChainId = parseInt(data.blockchainAccountId ?? "0");
		if(!blockChainId)
			throw new TranslatedException("errorMissingData");
		
		const session = await getLoggedInSessionData(db, request);
		
		const response = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", blockChainId)
			.where("userId", "=", session.userId)
			.limit(1)
			.executeTakeFirst();
		
		if(!response)
			throw new TranslatedException("errorNotFound");
		
		return {
			denotation: response.highestDenotation + 1
		}
	});
	return router;
}


