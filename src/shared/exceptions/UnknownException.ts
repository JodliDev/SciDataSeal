import ExceptionInterface from "./ExceptionInterface.ts";
import strings from "@locales/strings/en.json";
type LangKey = keyof typeof strings;

export default class UnknownException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	values?: (LangKey | string | number)[];
	
	constructor(message?: string, values?: (LangKey | string | number)[]) {
		super(message ?? "errorUnknown");
		this.values = values;
	}
}