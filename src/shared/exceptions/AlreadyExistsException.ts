import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class AlreadyExistsException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	values: (LangKey | string | number)[];
	constructor(field: string) {
		super("errorAlreadyExists");
		this.values = [field];
	}
}