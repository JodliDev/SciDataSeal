import {ResponseFormat} from "../shared/ResponseFormat.ts";
import {Response} from "express"
import ExceptionInterface from "../shared/exceptions/ExceptionInterface.ts";

export default function createErrorResponse(error: unknown, response: Response) {
	const knownError = error as ExceptionInterface
	response.status(knownError.requestStatus ?? 500).json({
		ok: false,
		error: knownError.message ?? "unknownError"
	} satisfies ResponseFormat<{}>);
}