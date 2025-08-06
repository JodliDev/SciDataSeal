import {ResponseType} from "./ResponseFormat.ts";

/**
 * Interface representing the Request and Response structure for POST requests.
 * Used by the interfaces in `src/shared/data`
 *
 * @property Endpoint The URL path or endpoint to which the POST request is sent.
 * @property Query key-value pairs for the URL query.
 * @property Request The structure of the body for the POST request.
 * @property Response - The expected structure of the response data.
 */
export default interface PostDataStructureInterface {
	Endpoint: string;
	Query?: Record<string, string>
	Request: Record<string, unknown>
	Response?: ResponseType
}