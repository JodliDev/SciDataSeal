import PostDataStructureInterface from "../../shared/PostDataStructureInterface.ts";
import unpackResponse from "./unpackResponse.ts";

type PostDataOptions = {
	query?: `?${string}`
	headers?: Record<string, string>
}
/**
 * Sends a POST request to the specified API endpoint with the given request body and options.
 * Receives a Template from type {@link PostDataStructureInterface} for typing in endpoint and return data.
 *
 * @template T - An interface that extends {@link PostDataStructureInterface} representing the endpoint, request, and response structure.
 * @param endpoint - The API endpoint to which the request is sent. This must be a valid string corresponding to the endpoint structure defined in the Template interface.
 * @param body - The request payload to be sent as the body of the POST request.
 * @param options - Optional configuration for the request, including query parameters and additional headers.
 * @return A promise that resolves to the response data, adhering to the structure defined in the Template interface, or undefined if the response cannot be processed.
 */
export default async function postData<T extends PostDataStructureInterface>(endpoint: T["Endpoint"], body: T["Request"], options?: PostDataOptions): Promise<T["Response"] | undefined> {
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