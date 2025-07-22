import {ResponseFormat} from "../../../shared/ResponseFormat.ts";
import express from "express";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import createErrorResponse from "../createErrorResponse.ts";
import GetDataStructureInterface from "../../../shared/GetDataStructureInterface.ts";

export function addGetRoute<T extends GetDataStructureInterface>(
	path: Endpoints,
	router: express.Router,
	validate: (query: Partial<T["Query"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
) {
	router.get(`${path}`, async (request, response) => {
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