import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import getBlockchain from "../actions/getBlockchain.ts";
import SetBlockchainInterface from "../../shared/data/SetBlockchainInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {WalletData} from "../blockchains/BlockchainInterface.ts";

/**
 * Creates a POST route for creating a blockchain account or changing an existing one (if an id was provided)
 *
 * @param db - The database connection.
 */
export default function setBlockchainAccount(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<SetBlockchainInterface>("/setBlockchainAccount", router, async (data) => {
		if(!data.blockchainName) {
			throw new TranslatedException("errorMissingData");
		}
		
		if(!isValidBackendString(data.blockchainName)) {
			throw new TranslatedException("errorFaultyData", "blockchainName");
		}
		
		if(data.id) {
			const account = await db.selectFrom("BlockchainAccount")
				.select(["blockchainAccountId"])
				.where("blockchainAccountId", "=", data.id)
				.executeTakeFirst();
			
			if(!account) {
				throw new UnauthorizedException();
			}
			
			await db
				.updateTable("BlockchainAccount")
				.set({
					blockchainName: data.blockchainName,
				})
				.where("blockchainAccountId", "=", data.id)
				.execute();
			
			return {
				blockchainAccountId: data.id
			};
		}
		else {
			if(!data.blockchainType) {
				throw new TranslatedException("errorMissingData");
			}
			if(!isValidBackendString(data.blockchainType)) {
				throw new TranslatedException("errorFaultyData", "blockchainType");
			}
			
			const blockChain = getBlockchain(data.blockchainType);
			
			let wallet: WalletData;
			if(data.useExisting) {
				if(!data.mnemonic) {
					throw new TranslatedException("errorMissingData");
				}
				if(!isValidBackendString(data.mnemonic)) {
					throw new TranslatedException("errorFaultyData", "mnemonic");
				}
				wallet = await blockChain.createWallet(data.mnemonic);
			}
			else {
				wallet = await blockChain.createWallet();
			}
			
			const insert = await db
				.insertInto("BlockchainAccount")
				.values({
					blockchainName: data.blockchainName,
					blockchainType: data.blockchainType,
					privateKey: wallet.privateKey,
					publicKey: wallet.publicKey,
					highestDenotation: 0,
				})
				.executeTakeFirst();
			
			return {
				blockchainAccountId: Number(insert.insertId),
				mnemonic: wallet.mnemonic,
			};
		}
	});
	return router;
}


