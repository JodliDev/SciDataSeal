import ExceptionInterface from "./ExceptionInterface.ts";
import strings from "@locales/strings/en.json";
type LangKey = keyof typeof strings;

/**
 * Represents a custom exception that expects a key string that can be translated by `Lang.get()`
 * and accepts dynamic parameters for `Lang.get()`.
 * Extends the built-in Error class and implements ExceptionInterface.
 * @see src/frontend/singleton/Lang.ts
 * @see ResponseFormat
 */
export default class TranslatedException extends Error implements ExceptionInterface {
	/**
	 * status code that is sent by the backend
	 */
	requestStatus: number = 400;
	
	/** Used as additional parameters in `Lang.get()`
	 * @see ResponseFormat
	 */
	values: (LangKey | string | number)[];
	
	constructor(message: LangKey, ... parameters: (LangKey | string | number)[]) {
		super(message);
		this.values = parameters;
	}
}