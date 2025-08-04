import ExceptionInterface from "./ExceptionInterface.ts";

export default class CannotChangeOwnUserException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor() {
		super("errorCannotChangeOwnUser");
	}
}