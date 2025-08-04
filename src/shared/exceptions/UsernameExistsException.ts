import ExceptionInterface from "./ExceptionInterface.ts";

export default class UsernameExistsException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor() {
		super("errorUsernameAlreadyExists");
	}
}