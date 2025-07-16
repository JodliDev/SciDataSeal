import {ResponseFormat} from "../../shared/ResponseFormat.ts";
import express from "express";
import MissingDataException from "../../shared/exceptions/MissingDataException.ts";
import {Endpoints} from "../../shared/Endpoints.ts";
import PostDataStructure from "../../shared/data/PostDataStructure.ts";
import createErrorResponse from "../createErrorResponse.ts";
import GetDataStructure from "../../shared/data/GetDataStructure.ts";

export function addPostRoute<T extends PostDataStructure>(
	path: Endpoints,
	router: express.Router,
	validate: (data: Partial<T["Request"]>, request: express.Request, response: express.Response) => Promise<T["Response"]>
) {
	router.post(`${path}`, async (request, response) => {
		try {
			if(!request.body)
				throw new MissingDataException();
			const data = await validate(request.body, request, response);
			
			response.json({
				ok: true,
				data: data
			} satisfies ResponseFormat<T["Response"]>);
		}
		catch (error) {
			createErrorResponse(error, response);
		}
	});
}

export function addGetRoute<T extends GetDataStructure>(
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