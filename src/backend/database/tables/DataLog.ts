import {ForeignKey, TableClass} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";
import {StudyTable} from "./Study.ts";

export default interface DataLog {
	logId: Generated<number>;
	studyId: number;
	signature: string;
}

@TableClass("DataLog", "logId")
export class DataLogTable implements Insertable<DataLog> {
	logId = 0;
	@ForeignKey(StudyTable, "studyId")
	studyId = 0;
	signature = "";
}