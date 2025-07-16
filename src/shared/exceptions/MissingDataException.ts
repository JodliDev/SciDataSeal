import ExceptionInterface from "./ExceptionInterface.ts";
import {Lang} from "../../frontend/singleton/Lang.ts";

export default class MissingDataException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor(message?: string) {
		super(message?? Lang.get("missingDataError"));
	}
}