import NetworkErrorException from "../../shared/exceptions/NetworkErrorException.ts";
import {ResponseFormat} from "../../shared/ResponseFormat.ts";
import RequestFailedException from "../../shared/exceptions/RequestFailedException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";
import PostDataStructure from "../../shared/data/PostDataStructure.ts";

export default async function postData<T extends PostDataStructure>(endpoint: Endpoints, body: T["Request"]): Promise<T["Response"]> {
	const response = await fetch(`api${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});
	const data = await response.json() as ResponseFormat<T["Response"]>;
	
	if(!response.ok)
		throw new NetworkErrorException(data.error);
	
	
	if(!data.ok)
		throw new RequestFailedException(data.error);
	
	return data.data;
}