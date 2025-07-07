import {Lang} from "../../frontend/Lang.ts";

export default class RequestFailedException extends Error {
	constructor(message?: string) {
		super(message?? Lang.get("unknownError"));
	}
}