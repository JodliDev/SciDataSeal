import TranslatedWithStatusException from "./TranslatedWithStatusException.ts";

/**
 * An exception that is thrown when the user is not authorized to perform an action.
 */
export default class UnauthorizedException extends TranslatedWithStatusException {
	constructor() {
		super("errorUnauthorized", 401);
	}
}