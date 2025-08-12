import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addPostRoute} from "../actions/routes/addPostRoute.ts";
import DeleteInterface from "../../shared/data/DeleteInterface.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";

/**
 * Creates a POST route for deleting an entry. The type parameter determines which entry to delete.
 *
 * @param db - The database connection.
 * @throws TranslatedException if id is missing
 */
export default function deleteEntry(db: DbType): express.Router {
	const router = express.Router();
	
	addPostRoute<DeleteInterface>("/deleteEntry", router, async (data, request) => {
		if(!data.id) {
			throw new TranslatedException("errorMissingData");
		}
		
		const session = await getLoggedInSessionData(db, request);
		
		switch(data.type) {
			case "blockchainAccount":
				if(!session.isAdmin) {
					throw new UnauthorizedException();
				}
				const questionnaire = await db.selectFrom("Questionnaire")
					.where("userId", "=", data.id)
					.limit(1)
					.executeTakeFirst();
				
				if(questionnaire) {
					throw new TranslatedException("errorMustDeleteAllQuestionnaires");
				}
				
				await db.deleteFrom("BlockchainAccount").where("blockchainAccountId", "=", data.id).limit(1).execute();
				break;
			case "questionnaire":
				await db.deleteFrom("Questionnaire").where("questionnaireId", "=", data.id).limit(1).execute();
				break;
			case "user":
				if(!session.isAdmin) {
					throw new UnauthorizedException();
				}
				if(session.userId == data.id) {
					throw new TranslatedException("errorCannotDeleteYourself");
				}
				
				await db.deleteFrom("User").where("userId", "=", data.id).limit(1).execute();
				break;
			default:
				throw new TranslatedException("errorMissingData");
		}
		
		return {};
	});
	return router;
}


