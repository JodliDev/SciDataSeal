import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class NotFoundException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor(message?: LangKey) {
		super(message ?? "errorNotFound");
	}
}