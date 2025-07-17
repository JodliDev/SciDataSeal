import {Endpoints} from "../../shared/definitions/Endpoints.ts";
import PostDataStructureInterface from "../../shared/PostDataStructureInterface.ts";
import unpackResponse from "./unpackResponse.ts";

export default async function postData<T extends PostDataStructureInterface>(endpoint: Endpoints, body: T["Request"]): Promise<T["Response"]> {
	const response = await fetch(`api${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});
	return await unpackResponse<T["Response"]>(response);
}