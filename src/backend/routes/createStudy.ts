import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import CreateStudyInterface from "../../shared/data/CreateStudyInterface.ts";
import {randomBytes} from "node:crypto";
import getSessionData from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";
import getBlockchain from "../actions/authentication/getBlockchain.ts";

export default function createStudy(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<CreateStudyInterface>("/createStudy", router, async (data, request) => {
		if(!data.studyName || !data.blockchainType || !data.blockchainPrivateKey)
			throw new MissingDataException();
		
		if(!isValidBackendString(data.studyName))
			throw new FaultyDataException("studyName");
		if(!isValidBackendString(data.blockchainType))
			throw new FaultyDataException("blockchainType");
		if(!isValidBackendString(data.blockchainPrivateKey))
			throw new FaultyDataException("blockchainPrivateKey");
		
		const session = await getSessionData(db, request);
		
		if(!session.userId)
			throw new UnauthorizedException();
		
		const apiPassword = randomBytes(32).toString("base64url");
		const blockChain = getBlockchain(data.blockchainType);
		
		const insert = await db
			.insertInto("Study")
			.values({
				userId: session.userId,
				studyName: data.studyName,
				blockchainType: data.blockchainType,
				blockchainPrivateKey: data.blockchainPrivateKey,
				blockchainPublicKey: await blockChain.getPublicKey(data.blockchainPrivateKey),
				apiPassword: apiPassword
			})
			.executeTakeFirst();
		
		
		return {
			studyId: Number(insert.insertId)
		};
	});
	return router;
}


