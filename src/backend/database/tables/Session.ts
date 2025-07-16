import {DbTable, ForeignKey} from "sqlmorpheus";
import {UserTable} from "./User.ts";
import {Generated, Insertable} from "kysely";

export default interface Session {
	sessionId: Generated<number>;
	userId: number;
	token: string;
	expires: number;
}

@DbTable("Session", "sessionId")
export class SessionTable implements Insertable<Session> {
	sessionId = 0;
	@ForeignKey(UserTable, "userId") userId = 0;
	token = "";
	expires = 0;
}