import NetworkErrorException from "../../shared/exceptions/NetworkErrorException.ts";
import {ResponseData} from "../../shared/ResponseData.ts";
import RequestFailedException from "../../shared/exceptions/RequestFailedException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";

export default async function postData(endpoint: Endpoints, body: object): Promise<unknown> {
	const response = await fetch(`api/${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});
	if(!response.ok)
		throw new NetworkErrorException();
	
	const data = await response.json() as ResponseData;
	
	if(!data.ok)
		throw new RequestFailedException(data.error);
	
	return data.data;
}