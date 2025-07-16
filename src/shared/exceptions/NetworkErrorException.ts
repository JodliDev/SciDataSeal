import ExceptionInterface from "./ExceptionInterface.ts";
import {Lang} from "../../frontend/singleton/Lang.ts";

export default class NetworkErrorException extends Error implements ExceptionInterface {
	requestStatus: number = 500;
	constructor(message?: string) {
		super(message ? Lang.getDynamic(message) : Lang.get("networkError"));
	}
}