import strings from "@locales/strings/en.json";
import TranslatedException from "./TranslatedException.ts";
type LangKey = keyof typeof strings;
/**
 * Same as {@link TranslatedException} but allows setting the status code sent by the backend.
 */
export default class TranslatedWithStatusException extends TranslatedException {
	requestStatus: number = 400
	
	constructor(message: LangKey, requestStatus: number = 400, ... parameters: (LangKey | string | number)[]) {
		super(message, ...parameters);
		this.requestStatus = requestStatus;
	}
}