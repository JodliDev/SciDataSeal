import {DataType, ForeignKey, TableClass} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";
import {UserTable} from "./User.ts";

export default interface Study {
	studyId: Generated<number>;
	userId: number;
	studyName: string;
	columns: string | null;
	apiPassword: string;
	blockchainType: string;
	blockchainPrivateKey: string;
}

@TableClass("Study", "studyId")
export class StudyTable implements Insertable<Study> {
	studyId: number = 0;
	@ForeignKey(UserTable, "userId")
	userId: number = 0;
	studyName: string = "";
	@DataType("string")
	columns: string | null = null;
	apiPassword: string = "";
	blockchainType: string = "";
	blockchainPrivateKey: string = "";
}