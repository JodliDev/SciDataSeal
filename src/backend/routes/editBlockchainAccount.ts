import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import EditBlockchainInterface from "../../shared/data/EditBlockchainInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Creates a POST route for creating a blockchain account or changing an existing one (if an id was provided)
 *
 * @param db - The database connection.
 */
export default function editBlockchainAccount(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<EditBlockchainInterface>("/editBlockchainAccount", router, async (data, request) => {
		if(!data.blockchainName || !data.blockchainType || !data.privateKey)
			throw new TranslatedException("errorMissingData");
		
		if(!isValidBackendString(data.blockchainName))
			throw new TranslatedException("errorFaultyData", "blockchainName");
		if(!isValidBackendString(data.blockchainType))
			throw new TranslatedException("errorFaultyData", "blockchainType");
		if(!isValidBackendString(data.privateKey))
			throw new TranslatedException("errorFaultyData", "privateKey");
		
		const session = await getLoggedInSessionData(db, request);
		
		const blockChain = getBlockchain(data.blockchainType);
		
		if(data.id) {
			const account = await db.selectFrom("BlockchainAccount")
				.select(["blockchainAccountId"])
				.where("blockchainAccountId", "=", data.id)
				.where("userId", "=", session.userId)
				.executeTakeFirst();
			
			if(!account)
				throw new UnauthorizedException();
			
			await db
				.updateTable("BlockchainAccount")
				.set({
					blockchainName: data.blockchainName,
					blockchainType: data.blockchainType,
					privateKey: data.privateKey,
					publicKey: await blockChain.getPublicKey(data.privateKey),
				})
				.where("blockchainAccountId", "=", data.id)
				.execute();
			
			return {
				blockchainAccountId: data.id
			};
		}
		else {
			const insert = await db
				.insertInto("BlockchainAccount")
				.values({
					userId: session.userId,
					blockchainName: data.blockchainName,
					blockchainType: data.blockchainType,
					privateKey: data.privateKey,
					publicKey: await blockChain.getPublicKey(data.privateKey),
					highestDenotation: 0,
				})
				.executeTakeFirst();
			
			return {
				blockchainAccountId: Number(insert.insertId)
			};
		}
	});
	return router;
}


