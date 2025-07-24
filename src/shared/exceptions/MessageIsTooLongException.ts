import ExceptionInterface from "./ExceptionInterface.ts";

export default class MessageIsTooLongException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor() {
		super("errorMessageIsTooLong");
	}
}