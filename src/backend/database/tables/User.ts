import {DbTable} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";

export default interface User {
	userId: Generated<number>;
	username: string;
	password: string;
	lastLogin: number;
}


@DbTable("User", "userId")
export class UserTable implements Insertable<User> {
	userId: number = 0;
	username: string = "";
	password: string = "";
	lastLogin: number = 0;
}