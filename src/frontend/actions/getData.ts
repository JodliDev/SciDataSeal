import NetworkErrorException from "../../shared/exceptions/NetworkErrorException.ts";
import {ResponseData} from "../../shared/ResponseData.ts";
import RequestFailedException from "../../shared/exceptions/RequestFailedException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";

export default async function getData(endpoint: Endpoints): Promise<unknown> {
	const response = await fetch(`api/${endpoint}`);
	if(!response.ok)
		throw new NetworkErrorException();
	
	const data = await response.json() as ResponseData;
	
	if(!data.ok)
		throw new RequestFailedException(data.error);
	
	return data.data;
}