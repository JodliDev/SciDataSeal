import {Lang} from "../../frontend/Lang.ts";
import ExceptionInterface from "./ExceptionInterface.ts";

export default class RequestFailedException extends Error implements ExceptionInterface {
	requestStatus: number = 500;
	constructor(message?: string) {
		super(message?? Lang.get("unknownError"));
	}
}