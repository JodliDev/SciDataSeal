import NetworkErrorException from "../../shared/exceptions/NetworkErrorException.ts";
import {ResponseFormat} from "../../shared/ResponseFormat.ts";
import RequestFailedException from "../../shared/exceptions/RequestFailedException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";
import GetDataStructure from "../../shared/data/GetDataStructure.ts";

export default async function getData<T extends GetDataStructure>(endpoint: Endpoints): Promise<T["Response"]> {
	const response = await fetch(`api/${endpoint}`);
	const data = await response.json() as ResponseFormat<T["Response"]>;
	
	if(!response.ok)
		throw new NetworkErrorException(data.error);
	
	if(!data.ok || !data.data)
		throw new RequestFailedException(data.error);
	
	return data.data;
}