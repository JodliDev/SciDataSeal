import strings from "@locales/strings/en.json";
type LangKey = keyof typeof strings;

export default interface ExceptionInterface {
	requestStatus?: number
	message?: string | LangKey
	values?: (LangKey | string | number)[]
}