import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import express from "express";
import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import createErrorResponse from "../createErrorResponse.ts";
import TranslatedException from "../../../shared/exceptions/TranslatedException.ts";

/**
 * Registers a POST route and calls the provided {@link validate} function for processing when the route is used.
 *
 * @param path The endpoint path for the POST route.
 * @param router The Express router to which the route will be added.
 * @param validate A function that handles request-specific processing. It should return a Promise that resolves to a data variable which is included in the POST response.
 */
export function addPostRoute<T extends PostDataStructureInterface>(
	path: T["Endpoint"],
	router: express.Router,
	validate: (data: Partial<T["Request"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
): void {
	router.post(`${path}`, async(request, response) => {
		try {
			if(!request.body)
				throw new TranslatedException("errorMissingData");
			const data = await validate(request.body, request, response);
			
			response.json({
				ok: true,
				data: data
			} satisfies ResponseFormat<T["Response"]>);
		} catch(error) {
			createErrorResponse(error, response);
		}
	});
}