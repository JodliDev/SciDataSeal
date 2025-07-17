import {ResponseType} from "./ResponseType.ts";

export default interface GetDataStructureInterface {
	Query?: Record<string, unknown>
	Response: ResponseType
}