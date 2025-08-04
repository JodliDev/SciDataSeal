import TranslatedException from "./TranslatedException.ts";

export default class UnauthorizedException extends TranslatedException {
	constructor() {
		super("errorUnauthorized", 401);
	}
}