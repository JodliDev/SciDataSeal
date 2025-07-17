import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class TooShortException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	values: (LangKey | string | number)[];
	constructor(field: string, length: number, message: LangKey = "errorTooShort") {
		super(message ?? "errorMissingData");
		this.values = [field, length];
	}
}