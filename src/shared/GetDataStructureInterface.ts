import {ResponseType} from "./ResponseType.ts";

export default interface GetDataStructureInterface {
	Endpoint: string;
	Query?: Record<string, string>
	Response: ResponseType
}