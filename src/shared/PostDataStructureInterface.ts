import {ResponseType} from "./ResponseType.ts";

export default interface PostDataStructureInterface {
	Request: Record<string, unknown>
	Response?: ResponseType
}