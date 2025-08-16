import {ForeignKey, TableClass} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";
import {QuestionnaireTable} from "./Questionnaire.ts";
import {UserTable} from "./User.ts";
import {BlockchainAccountTable} from "./BlockchainAccount.ts";

export default interface DataLog {
	logId: Generated<number>;
	userId: number;
	questionnaireId: number;
	blockchainAccountId: number;
	timestamp: number;
	signature: string;
}

@TableClass("DataLog", "logId")
export class DataLogTable implements Insertable<DataLog> {
	logId = 0;
	@ForeignKey(UserTable, "userId", {onDelete: "CASCADE"})
	userId = 0;
	@ForeignKey(QuestionnaireTable, "questionnaireId", {onDelete: "CASCADE"})
	questionnaireId = 0;
	@ForeignKey(BlockchainAccountTable, "blockchainAccountId", {onDelete: "CASCADE"})
	blockchainAccountId = 0;
	timestamp = 0;
	signature = "";
}