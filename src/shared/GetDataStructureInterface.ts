import {ResponseType} from "./ResponseFormat.ts";

/**
 * Interface representing the Request and Response structure for GET requests.
 * Used by the interfaces in `src/shared/data`.
 *
 * @property Endpoint The URL path or endpoint to which the GET request is sent.
 * @property Query key-value pairs for the URL query.
 * @property Response - The expected structure of the response data.
 */
export default interface GetDataStructureInterface {
	Endpoint: string;
	Query?: Record<string, string>
	Response: ResponseType
}