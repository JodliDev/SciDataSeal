import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import express from "express";
import MissingDataException from "../../../shared/exceptions/MissingDataException.ts";
import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import createErrorResponse from "../createErrorResponse.ts";

export function addPostRoute<T extends PostDataStructureInterface>(
	path: Endpoints,
	router: express.Router,
	validate: (data: Partial<T["Request"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
) {
	router.post(`${path}`, async(request, response) => {
		try {
			if(!request.body)
				throw new MissingDataException();
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