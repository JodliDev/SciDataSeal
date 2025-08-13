import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import GetStudyInterface from "../../shared/data/GetStudyInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";

/**
 * Creates a GET route for retrieving a user
 */
export default function getStudy(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetStudyInterface>("/getStudy", router, async (data, request) => {
		const session = await getLoggedInSessionData(db, request);
		const studyId = parseInt(data.studyId ?? "0");
		
		const study = await db.selectFrom("Study")
			.select(["studyName", "apiPassword", "blockchainAccountId"])
			.where("studyId", "=", studyId)
			.where("userId", "=", session.userId)
			.limit(1)
			.executeTakeFirst();
		
		if(!study)
			throw new TranslatedException("errorNotFound");
		
		return {
			studyId: studyId,
			studyName: study.studyName,
			apiPassword: study.apiPassword,
			blockchainAccountId: study.blockchainAccountId,
		}
	});
	return router;
}


