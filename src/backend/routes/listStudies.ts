import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListStudiesInterface from "../../shared/data/ListStudiesInterface.ts";

export default function listStudies(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListStudiesInterface>("/listStudies", router, async (_, request) => {
		
		const session = await getSessionData(db, request);
		
		if(!session.userId)
			throw new UnauthorizedException();
		
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


