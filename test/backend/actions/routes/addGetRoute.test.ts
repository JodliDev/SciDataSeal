import {describe, expect, it, vi} from "vitest";
import express from "express";
import supertest from "supertest";
import {addGetRoute} from "../../../../src/backend/actions/routes/addGetRoute.ts";

interface MockDataInterface {
	Endpoint: "/test";
	Query: { name: string };
	Response: { message: string };
}

describe("addGetRoute", () => {
	const app = express();
	const router = express.Router();
	
	const mockValidate = vi.fn(async(query: Partial<MockDataInterface["Query"]>) => {
		if(!query.name)
			throw new Error("Invalid query");
		
		return {message: `Hello, ${query.name}`};
	});
	
	addGetRoute<MockDataInterface>("/test", router, mockValidate);
	app.use(router);
	
	it("should return a successful response for valid query parameters", async() => {
		const response = await supertest(app).get("/test").query({name: "John"});
		
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			ok: true,
			data: {message: "Hello, John"},
		});
		expect(mockValidate).toHaveBeenCalledWith({name: "John"}, expect.any(Object), expect.any(Object));
	});
	
	it("should return an error response for invalid query parameters", async() => {
		const response = await supertest(app).get("/test").query({});
		
		expect(response.status).toBe(500);
		expect(response.body.ok).toBe(false);
		expect(mockValidate).toHaveBeenCalledWith({}, expect.any(Object), expect.any(Object));
	});
});