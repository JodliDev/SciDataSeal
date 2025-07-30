import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import CreateQuestionnaireInterface from "../../shared/data/CreateQuestionnaireInterface.ts";
import {randomBytes} from "node:crypto";
import getSessionData from "../actions/authentication/getSessionData.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import FaultyDataException from "../../shared/exceptions/FaultyDataException.ts";

export default function createQuestionnaire(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<CreateQuestionnaireInterface>("/createQuestionnaire", router, async (data, request) => {
		if(!data.questionnaireName || !data.blockchainAccountId)
			throw new MissingDataException();
		
		if(!isValidBackendString(data.questionnaireName))
			throw new FaultyDataException("questionnaireName");
		
		const session = await getSessionData(db, request);
		
		if(!session.userId)
			throw new UnauthorizedException();
		
		const account = await db.selectFrom("BlockchainAccount")
			.select(["highestDenotation"])
			.where("blockchainAccountId", "=", data.blockchainAccountId)
			.where("userId", "=", session.userId)
			.executeTakeFirst();
		
		if(!account)
			throw new UnauthorizedException();
		
		const apiPassword = randomBytes(32).toString("base64url");
		const dataId = account.highestDenotation + 1;
		await db.updateTable("BlockchainAccount")
			.set({highestDenotation: dataId})
			.where("blockchainAccountId", "=", data.blockchainAccountId)
			.execute();
		
		const insert = await db
			.insertInto("Questionnaire")
			.values({
				userId: session.userId,
				questionnaireName: data.questionnaireName,
				blockchainAccountId: data.blockchainAccountId,
				apiPassword: apiPassword,
				dataKey: apiPassword,
				columns: "",
				blockchainDenotation: dataId
			})
			.executeTakeFirst();
		
		return {
			questionnaireId: Number(insert.insertId)
		};
	});
	return router;
}


