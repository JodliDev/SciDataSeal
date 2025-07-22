import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class FaultyDataException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	values: (LangKey | string | number)[];
	constructor(field: string) {
		super("errorFaultyData");
		this.values = [field];
	}
}