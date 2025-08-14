import TranslatedWithStatusException from "./TranslatedWithStatusException.ts";

/**
 * An exception that is thrown when the user cancels an action.
 */
export default class CanceledByUserException extends TranslatedWithStatusException {
	constructor() {
		super("errorCanceledByUser", 200);
	}
}