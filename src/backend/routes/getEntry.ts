import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import GetEntryInterface, {GetDefinitions} from "../../shared/data/GetEntryInterface.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";

/**
 * Creates a GET route for retrieving a user
 */
export default function getEntry(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetEntryInterface<keyof GetDefinitions>>("/getEntry", router, async (data, request) => {
		const id = parseInt(data.id ?? "0");
		if(!id) {
			throw new TranslatedException("errorMissingData");
		}
		async function getData<T extends keyof GetDefinitions>(data: Partial<GetEntryInterface<T>["Query"]>): Promise<GetEntryInterface<T>["Response"] | undefined> {
			const session = await getLoggedInSessionData(db, request);
			
			switch(data.type) {
				case "blockchainAccount":
					if(!session.isAdmin) {
						throw new UnauthorizedException();
					}
					return await db.selectFrom("BlockchainAccount")
						.select(["blockchainAccountId", "blockchainName", "blockchainType", "privateKey", "publicKey", "highestDenotation"])
						.where("blockchainAccountId", "=", id)
						.limit(1)
						.executeTakeFirst();
					
				case "questionnaire":
					return await db.selectFrom("Questionnaire")
						.select(["questionnaireId", "questionnaireName", "blockchainDenotation", "blockchainAccountId", "studyId", "apiPassword", "dataKey", "columns"])
						.where("questionnaireId", "=", id)
						.where("userId", "=", session.userId)
						.limit(1)
						.executeTakeFirst();
					
				case "study":
					return await db.selectFrom("Study")
						.select(["studyId", "studyName", "apiPassword", "blockchainAccountId"])
						.where("studyId", "=", id)
						.where("userId", "=", session.userId)
						.limit(1)
						.executeTakeFirst();
					
				case "user":
					if(!session.isAdmin) {
						throw new UnauthorizedException();
					}
					return await db.selectFrom("User")
						.select(["userId", "username", "isAdmin"])
						.where("userId", "=", id)
						.limit(1)
						.executeTakeFirst();
					
				default:
					throw new TranslatedException("errorFaultyData", "type");
			}
		}
		
		const response = await getData(data);
		
		if(!response) {
			throw new TranslatedException("errorNotFound");
		}
		else {
			return response;
		}
	});
	return router;
}


