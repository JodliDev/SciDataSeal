import TranslatedWithStatusException from "./TranslatedWithStatusException.ts";

export default class UnauthorizedException extends TranslatedWithStatusException {
	constructor() {
		super("errorUnauthorized", 401);
	}
}