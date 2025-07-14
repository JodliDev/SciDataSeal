import {Generated} from "kysely";

export default interface Session {
	sessionId: Generated<number>;
	userId: number;
	token: string;
	expires: Date;
}