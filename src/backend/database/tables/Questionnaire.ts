import {DataType, ForeignKey, TableClass} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";
import {UserTable} from "./User.ts";
import {BlockchainAccountTable} from "./BlockchainAccount.ts";
import {StudyTable} from "./Study.ts";

export default interface Questionnaire {
	questionnaireId: Generated<number>;
	studyId: number;
	userId: number;
	blockchainAccountId: number;
	blockchainDenotation: number;
	questionnaireName: string;
	columns: string | null;
	apiPassword: string;
	dataKey: string;
}

@TableClass("Questionnaire", "questionnaireId")
export class QuestionnaireTable implements Insertable<Questionnaire> {
	questionnaireId: number = 0;
	@ForeignKey(StudyTable, "studyId", {onDelete: "CASCADE"})
	studyId: number = 0;
	@ForeignKey(UserTable, "userId", {onDelete: "CASCADE"})
	userId = 0;
	@ForeignKey(BlockchainAccountTable, "blockchainAccountId", {onDelete: "CASCADE"})
	blockchainAccountId = 0;
	blockchainDenotation = 0;
	questionnaireName = "";
	@DataType("string")
	columns = null;
	apiPassword = "";
	dataKey = "";
}