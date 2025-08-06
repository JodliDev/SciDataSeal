import strings from "@locales/strings/en.json";
type LangKey = keyof typeof strings;

/**
 * Represents the default structure of an exception to standardize error handling and messaging.
 */
export default interface ExceptionInterface {
	requestStatus?: number
	message?: string | LangKey
	values?: (LangKey | string | number)[]
}