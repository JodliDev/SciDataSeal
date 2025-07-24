import {Endpoints} from "../../shared/definitions/Endpoints.ts";
import PostDataStructureInterface from "../../shared/PostDataStructureInterface.ts";
import unpackResponse from "./unpackResponse.ts";

type PostDataOptions = {
	query?: `?${string}`
	headers?: Record<string, string>
}
export default async function postData<T extends PostDataStructureInterface>(endpoint: Endpoints, body: T["Request"], options?: PostDataOptions): Promise<T["Response"]> {
	const response = await fetch(`api${endpoint}${options?.query ?? ""}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...options?.headers
		},
		body: JSON.stringify(body)
	});
	return await unpackResponse<T["Response"]>(response);
}