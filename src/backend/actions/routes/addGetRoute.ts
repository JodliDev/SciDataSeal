import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import express from "express";
import MissingDataException from "../../../shared/exceptions/MissingDataException.ts";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import createErrorResponse from "../createErrorResponse.ts";
import GetDataStructureInterface from "../../../shared/GetDataStructureInterface.ts";

export function addGetRoute<T extends GetDataStructureInterface>(
	path: Endpoints,
	router: express.Router,
	validate: (query: Partial<T["Query"]>) => Promise<T["Response"]>
) {
	router.post(`${path}`, async (request, response) => {
		try {
			const query = request.query as Partial<T["Query"]>
			
			if(!request.body)
				throw new MissingDataException();
			const data = await validate(query);
			
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