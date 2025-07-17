import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class NetworkErrorException extends Error implements ExceptionInterface {
	requestStatus: number = 500;
	constructor(message?: LangKey) {
		super(message ?? "errorNetwork");
	}
}