import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import express from "express";
import createErrorResponse from "../createErrorResponse.ts";
import GetDataStructureInterface from "../../../shared/GetDataStructureInterface.ts";

/**
 * Registers a GET route and calls the provided {@link validate} function for processing when the route is used.
 *
 * @param path The endpoint path for the GET route.
 * @param router The Express router to which the route will be added.
 * @param validate A function that handles request-specific processing. It should return a Promise that resolves to a data variable which is included in the GET response.
 */
export function addGetRoute<T extends GetDataStructureInterface>(
	path: T["Endpoint"],
	router: express.Router,
	validate: (query: Partial<T["Query"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
): void {
	router.get(path, async (request, response) => {
		try {
			const query = request.query as Partial<T["Query"]>
			const data = await validate(query, request, response);
			
			response.json({
				ok: true,
				data: data
			} satisfies ResponseFormat<T["Response"]>);
		}
		catch (error) {
			createErrorResponse(error, response);
		}
	})
}