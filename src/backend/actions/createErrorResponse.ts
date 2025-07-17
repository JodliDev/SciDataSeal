import {ResponseFormat} from "../../shared/ResponseFormat.ts";
import {Response} from "express"
import ExceptionInterface from "../../shared/exceptions/ExceptionInterface.ts";

/**
 * Generates an error response based on the provided error object and sends it using the provided response object.
 *
 * @see src/frontend/actions/unpackResponse.ts
 * @param error - The error object which contains information to create the error response.
 * @param response - The HTTP response object used to send the error response to the client.
 */
export default function createErrorResponse(error: unknown, response: Response) {
	const knownError = error as ExceptionInterface;
	response.status(knownError.requestStatus ?? 500).json({
		ok: false,
		error: {message: knownError.message ?? "errorUnknown", values: knownError.values ?? []}
	} satisfies ResponseFormat<{}>);
}