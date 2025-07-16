import {DbTable} from "sqlmorpheus";
import {Generated, Insertable} from "kysely";

export default interface User {
	userId: Generated<number>;
	name: string;
	password: string;
	isAdmin: boolean;
	lastLogin: number;
}


@DbTable("User", "userId")
export class UserTable implements Insertable<User> {
	userId: number = 0;
	name: string = "";
	password: string = "";
	isAdmin: boolean = false;
	lastLogin: number = 0;
}