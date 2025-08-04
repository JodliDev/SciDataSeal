import ExceptionInterface from "./ExceptionInterface.ts";
import strings from "@locales/strings/en.json";
type LangKey = keyof typeof strings;

export default class TranslatedException extends Error implements ExceptionInterface {
	requestStatus: number = 400
	values: (LangKey | string | number)[];
	
	constructor(message: LangKey, ... parameters: (LangKey | string | number)[]) {
		super(message);
		this.values = parameters;
	}
}