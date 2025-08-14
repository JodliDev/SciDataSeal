import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListEntriesInterface, {ListDefinitions} from "../../shared/data/ListEntriesInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";

/**
 * Creates a GET route for retrieving a list of entries
 */
export default function listEntries(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListEntriesInterface<keyof ListDefinitions>>("/listEntries", router, async (data, request) => {
		
		async function getData<T extends keyof ListDefinitions>(data: Partial<ListEntriesInterface<T>["Query"]>): Promise<ListEntriesInterface<T>["Response"]["list"]> {
			const session = await getLoggedInSessionData(db, request);
			
			
			switch(data.type) {
				case "blockchainAccounts":
					return await db.selectFrom("BlockchainAccount")
						.select(["blockchainAccountId as id", "blockchainName as label"])
						.orderBy("blockchainName")
						.execute();
					
				case "questionnaires":
					const qData = data as ListEntriesInterface<"questionnaires">["Query"];
					return (qData.studyId === undefined
						? await db.selectFrom("Questionnaire")
							.select(["questionnaireId as id", "questionnaireName as label"])
							.where("userId", "=", session.userId)
							.orderBy("questionnaireName")
							.execute()
						: await db.selectFrom("Questionnaire")
							.select(["questionnaireId as id", "questionnaireName as label"])
							.where("studyId", "=", parseInt(qData.studyId) || 0)
							.where("userId", "=", session.userId)
							.orderBy("questionnaireName")
							.execute());
					
				case "studies":
					return await db.selectFrom("Study")
						.select(["studyId as id", "studyName as label"])
						.where("userId", "=", session.userId)
						.orderBy("studyName")
						.execute();
					
				case "users":
					if(!session.isAdmin) {
						throw new UnauthorizedException();
					}
					return await db.selectFrom("User")
						.select(["userId as id", "username as label"])
						.orderBy("username")
						.execute();
					
				default:
					throw new TranslatedException("errorFaultyData", "type");
			}
		}
		
		if(data.type === undefined) {
			throw new TranslatedException("errorMissingData");
		}
		
		return {
			list: await getData(data)
		}
	});
	return router;
}


