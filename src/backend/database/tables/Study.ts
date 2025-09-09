import {Generated, Insertable} from "kysely";
import {ForeignKey, TableClass} from "sqlmorpheus";
import {UserTable} from "./User.ts";
import {BlockchainAccountTable} from "./BlockchainAccount.ts";

export default interface Study {
	studyId: Generated<number>;
	userId: number;
	studyName: string;
	blockchainAccountId: number;
	apiPassword: string;
	dataKey: string;
}

@TableClass("Study", "studyId")
export class StudyTable implements Insertable<Study> {
	studyId: number = 0;
	@ForeignKey(UserTable, "userId", {onDelete: "CASCADE"})
	userId: number = 0;
	studyName: string = "";
	@ForeignKey(BlockchainAccountTable, "blockchainAccountId", {onDelete: "CASCADE"})
	blockchainAccountId: number = 1;
	apiPassword: string = "";
	dataKey: string = "";
}