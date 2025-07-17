import {LangKey} from "../../frontend/singleton/Lang.ts";
import ExceptionInterface from "./ExceptionInterface.ts";

export default class RequestFailedException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor(message?: LangKey) {
		super(message ?? "errorUnknown");
	}
}