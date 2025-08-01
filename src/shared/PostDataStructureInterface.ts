import {ResponseType} from "./ResponseType.ts";

export default interface PostDataStructureInterface {
	Endpoint: string;
	Query?: Record<string, string>
	Request: Record<string, unknown>
	Response?: ResponseType
}