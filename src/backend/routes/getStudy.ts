import express from "express";
import {DbType} from "../database/setupDb.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import getSessionData from "../actions/authentication/getSessionData.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GetStudyInterface from "../../shared/data/GetStudyInterface.ts";
import NotFoundException from "../../shared/exceptions/NotFoundException.ts";

export default function getStudy(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<GetStudyInterface>("/getStudy", router, async (data, request) => {
		
		const session = await getSessionData(db, request);
		const studyId = parseInt(data.studyId ?? "0");
		
		if(!session.userId)
			throw new UnauthorizedException();
		
		const study = await db.selectFrom("Study")
			.select(["studyId", "studyName", "apiPassword"])
			.where("userId", "=", session.userId)
			.where("studyId", "=", studyId)
			.limit(1)
			.executeTakeFirst();
		
		if(!study)
			throw new NotFoundException();
		
		return {
			studyName: study.studyName,
			studyId: study.studyId,
			apiPassword: study.apiPassword
		}
	});
	return router;
}


