import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class UnknownException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	values?: (LangKey | string | number)[];
	
	constructor(message?: string, values?: (LangKey | string | number)[]) {
		super(message ?? "errorUnknown");
		this.values = values;
	}
}