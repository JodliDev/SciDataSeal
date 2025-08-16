import express from "express";
import {DbType} from "../database/setupDb.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ListEntriesInterface, {ListDefinitions, ListResponseEntryType} from "../../shared/data/ListEntriesInterface.ts";
import {getLoggedInSessionData} from "../actions/authentication/getSessionData.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";
import UnauthorizedException from "../../shared/exceptions/UnauthorizedException.ts";
import {PAGE_SIZE} from "../../shared/definitions/Constants.ts";
import {SelectQueryBuilder} from "kysely";
import {KyselyTables} from "../database/DatabaseConfigs.ts";

type QueryBuilder<T> = SelectQueryBuilder<KyselyTables, any, T>;
interface DataQueryFormat<T> {
	query: QueryBuilder<{}>,
	select: QueryBuilder<T>
}

/**
 * Creates a GET route for retrieving a list of entries
 */
export default function listEntries(db: DbType): express.Router {
	const router = express.Router();
	
	addGetRoute<ListEntriesInterface<keyof ListDefinitions>>("/listEntries", router, async (data, request) => {
		const session = await getLoggedInSessionData(db, request);
		
		function getQuery<T extends keyof ListDefinitions>(data: Partial<ListEntriesInterface<T>["Query"]>): DataQueryFormat<ListResponseEntryType<T>> {
			switch(data.type) {
				case "blockchainAccounts": {
					const query = db.selectFrom("BlockchainAccount");
					
					const select = query
						.select(["blockchainAccountId as id", "blockchainName as label"])
						.orderBy("blockchainName");
					
					return {query: query, select: select};
				}
				case "dataLogs": {
					const dataLogsData = data as Partial<ListEntriesInterface<"dataLogs">["Query"]>;
					const questionnaireId = parseInt(dataLogsData.questionnaireId ?? "0") || 0;
					
					const query = db.selectFrom("DataLog")
						.where("questionnaireId", "=", questionnaireId)
						.where("userId", "=", session.userId);
					
					const select = query
						.innerJoin("BlockchainAccount", "BlockchainAccount.blockchainAccountId", "DataLog.blockchainAccountId")
						.select(["logId as id", "timestamp as label", "signature", "BlockchainAccount.blockchainAccountId as blockchainAccountId", "blockchainType"])
						.orderBy("timestamp");
					
					return {query: query, select: select};
				}
				case "questionnaires": {
					const qData = data as Partial<ListEntriesInterface<"questionnaires">["Query"]>;
					const query = qData.studyId === undefined
						? db.selectFrom("Questionnaire")
							.where("userId", "=", session.userId)
						: db.selectFrom("Questionnaire")
							.where("studyId", "=", parseInt(qData.studyId) || 0)
							.where("userId", "=", session.userId);
					
					const select = query
						.select(["questionnaireId as id", "questionnaireName as label"])
						.orderBy("questionnaireName");
					
					return {query: query, select: select};
				}
				case "studies": {
					const query = db.selectFrom("Study")
						.where("userId", "=", session.userId);
					
					const select = query
						.select(["studyId as id", "studyName as label"])
						.orderBy("studyName");
					
					return {query: query, select: select};
				}
				case "users": {
					if(!session.isAdmin) {
						throw new UnauthorizedException();
					}
					const query = db.selectFrom("User");
					
					const select = query
						.select(["userId as id", "username as label"])
						.orderBy("username");
					
					return {query: query, select: select};
				}
				default:
					throw new TranslatedException("errorFaultyData", "type");
			}
		}
		
		if(data.type === undefined) {
			throw new TranslatedException("errorMissingData");
		}
		const page = parseInt(data.page ?? "0") ?? 0;
		const offset = page * PAGE_SIZE;
		const query = getQuery(data);
		
		return {
			list: await query.select
				.offset(offset)
				.limit(PAGE_SIZE)
				.execute(),
			totalCount: (await query.query
				.select(db.fn.countAll().as("totalCount"))
				.executeTakeFirst())?.totalCount as number ?? 0,
		}
	});
	return router;
}


