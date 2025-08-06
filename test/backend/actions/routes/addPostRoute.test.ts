import {afterEach, describe, expect, it, vi} from "vitest";
import express from "express";
import supertest from "supertest";
import {addPostRoute} from "../../../../src/backend/actions/routes/addPostRoute.ts";

describe("addPostRoute", () => {
	const mockValidate = vi.fn();
	
	const router = express.Router();
	const app = express();
	app.use(express.json());
	addPostRoute("/test", router, mockValidate);
	app.use("/", router);
	
	afterEach(() => {
		mockValidate.mockReset()
	});
	it("should respond with the expected response data when request body is valid", async() => {
		mockValidate.mockResolvedValue({success: true});
		
		const response = await supertest(app)
			.post("/test")
			.send({key: "value"});
		
		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual({
			ok: true,
			data: {success: true},
		});
		expect(mockValidate).toHaveBeenCalledWith({key: "value"}, expect.anything(), expect.anything());
	});
	
	it("should call createErrorResponse when request body is missing", async() => {
		const response = await supertest(app).post("/test").send(undefined);
		
		expect(response.status).toBe(400);
		expect(response.body.ok).toBe(false);
	});
	
	it("should handle validation errors gracefully", async() => {
		mockValidate.mockRejectedValue(new Error("Validation error"));
		
		const response = await supertest(app)
			.post("/test")
			.send({key: "invalid"});
		
		expect(response.status).toBe(500);
		expect(response.body.ok).toBe(false);
	});
});