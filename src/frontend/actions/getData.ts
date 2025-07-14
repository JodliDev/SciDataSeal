import NetworkErrorException from "../../shared/exceptions/NetworkErrorException.ts";
import {ResponseData} from "../../shared/ResponseData.ts";
import RequestFailedException from "../../shared/exceptions/RequestFailedException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";

export default async function getData(endpoint: Endpoints): Promise<unknown> {
	const response = await fetch(`api/${endpoint}`);
	const data = await response.json() as ResponseData;
	
	if(!response.ok)
		throw new NetworkErrorException(data.error);
	
	if(!data.ok)
		throw new RequestFailedException(data.error);
	
	return data.data;
}