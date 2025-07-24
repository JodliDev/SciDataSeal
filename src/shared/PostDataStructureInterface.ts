import {ResponseType} from "./ResponseType.ts";

export default interface PostDataStructureInterface {
	Query?: Record<string, string>
	Request: Record<string, unknown> | unknown[]
	Response?: ResponseType
}