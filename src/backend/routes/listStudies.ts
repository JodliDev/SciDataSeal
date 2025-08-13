import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListStudiesInterface from "../../shared/data/ListStudiesInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";

/**
 * Creates a GET route for retrieving a list of all studies
 */
export default function listStudies(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListStudiesInterface>("/listStudies", router, async (_, request) => {
		const session = await getLoggedInSessionData(db, request);
		
		const studies = await db.selectFrom("Study")
			.select(["studyId", "studyName"])
			.where("userId", "=", session.userId)
			.orderBy("studyName")
			.execute();
		
		return {
			studies: studies
		}
	});
	return router;
}
