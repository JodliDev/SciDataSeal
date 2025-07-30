import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";
import EditBlockchainInterface from "../../shared/data/EditBlockchainInterface.ts";

export default function editBlockchainAccount(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<EditBlockchainInterface>("/editBlockchainAccount", router, async (data, request) => {
		if(!data.blockchainName || !data.blockchainType || !data.privateKey)
			throw new MissingDataException();
		
		if(!isValidBackendString(data.blockchainName))
			throw new FaultyDataException("blockchainName");
		if(!isValidBackendString(data.blockchainType))
			throw new FaultyDataException("blockchainType");
		if(!isValidBackendString(data.privateKey))
			throw new FaultyDataException("privateKey");
		
		const session = await getSessionData(db, request);
		
		if(!session.userId)
			throw new UnauthorizedException();
		
		const blockChain = getBlockchain(data.blockchainType);
		
		if(data.blockchainAccountId) {
			const account = await db.selectFrom("BlockchainAccount")
				.select(["blockchainAccountId"])
				.where("blockchainAccountId", "=", data.blockchainAccountId)
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
				.executeTakeFirst();
			
			return {
				blockchainAccountId: data.blockchainAccountId
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


