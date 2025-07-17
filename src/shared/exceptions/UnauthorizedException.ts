import ExceptionInterface from "./ExceptionInterface.ts";

export default class UnauthorizedException extends Error implements ExceptionInterface {
	requestStatus: number = 401;
	constructor() {
		super("errorUnauthorized");
	}
}