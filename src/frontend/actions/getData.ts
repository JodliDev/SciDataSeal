import {Endpoints} from "../../shared/definitions/Endpoints.ts";
import GetDataStructureInterface from "../../shared/GetDataStructureInterface.ts";
import UnknownException from "../../shared/exceptions/UnknownException.ts";
import unpackResponse from "./unpackResponse.ts";

export default async function getData<T extends GetDataStructureInterface>(endpoint: Endpoints): Promise<T["Response"]> {
	const response = await fetch(`api/${endpoint}`);
	const data = await unpackResponse<T["Response"]>(response);
	
	if(!data)
		throw new UnknownException();
	
	return data;
}