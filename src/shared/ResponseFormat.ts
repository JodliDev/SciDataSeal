import ExceptionInterface from "./exceptions/ExceptionInterface.ts";
import {ResponseType} from "./ResponseType.ts";

export interface ResponseFormat<T extends ResponseType | undefined> {
	ok: boolean;
	data?: T;
	error?: {message: ExceptionInterface["message"], values: ExceptionInterface["values"]};
}