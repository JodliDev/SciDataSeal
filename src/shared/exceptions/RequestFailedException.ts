import {Lang} from "../../frontend/singleton/Lang.ts";
import ExceptionInterface from "./ExceptionInterface.ts";

export default class RequestFailedException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor(message?: string) {
		super(message ? Lang.getDynamic(message) : Lang.get("unknownError"));
	}
}