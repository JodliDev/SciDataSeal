import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import express from "express";
import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import createErrorResponse from "../createErrorResponse.ts";
import TranslatedException from "../../../shared/exceptions/TranslatedException.ts";

export function addPostRoute<T extends PostDataStructureInterface>(
	path: T["Endpoint"],
	router: express.Router,
	validate: (data: Partial<T["Request"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
) {
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