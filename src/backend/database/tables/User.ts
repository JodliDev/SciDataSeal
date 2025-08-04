import {Generated, Insertable} from "kysely";
import {TableClass} from "sqlmorpheus";

export default interface User {
	userId: Generated<number>;
	username: string;
	password: string;
	lastLogin: number;
	isAdmin: boolean;
}


@TableClass("User", "userId")
export class UserTable implements Insertable<User> {
	userId: number = 0;
	username: string = "";
	password: string = "";
	lastLogin: number = 0;
	isAdmin: boolean = false;
}