import {ResponseType} from "./ResponseType.ts";

export default interface GetDataStructureInterface {
	Query?: Record<string, string>
	Response: ResponseType
}