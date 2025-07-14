import {Generated} from "kysely";

export default interface User {
	userId: Generated<number>;
	name: string;
	password: string;
	isAdmin: boolean;
	lastLogin: Date;
}