import GetDataStructureInterface from "../../shared/GetDataStructureInterface.ts";
import unpackResponse from "./unpackResponse.ts";

/**
 * Fetches data from the given endpoint and optionally appends a query string to the request.
 *
 * @template T - An interface that extends {@link GetDataStructureInterface} representing the endpoint, and response structure.
 * @param endpoint - The API endpoint from which data is to be fetched. This must be a valid string corresponding to the endpoint structure defined in the Template interface.
 * @param query - An optional query string to be appended to the endpoint, starting with `?`.
 * @return A promise that resolves to the response data, adhering to the structure defined in the Template interface, or undefined if the response cannot be processed.
 */
export default async function getData<T extends GetDataStructureInterface>(endpoint: T["Endpoint"], query?: `?${string}`): Promise<T["Response"] | undefined> {
	const response = await fetch(`api${endpoint}${query ?? ""}`);
	return await unpackResponse<T["Response"]>(response);
}