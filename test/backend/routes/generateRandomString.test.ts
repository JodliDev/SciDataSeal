import {describe, expect, it} from "vitest";
import request from "supertest";
import express from "express";
import generateRandomString from "../../../src/backend/routes/generateRandomString.ts";

describe("generateRandomString", () => {
	const app = express();
	app.use(generateRandomString());
	
	it("should return a base64url encoded string of given length", async() => {
		const length = 16; // Length of the random string
		const response = await request(app).get(`/generateRandomString?length=${length}&count=1`);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toHaveProperty("generatedString");
		expect(Buffer.from(response.body.data.generatedString[0], "base64url")).toHaveLength(length);
	});
	
	it("should return a default base64url encoded string of length 32 when length is not provided", async() => {
		const response = await request(app).get("/generateRandomString?count=1");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toHaveProperty("generatedString");
		expect(Buffer.from(response.body.data.generatedString[0], "base64url")).toHaveLength(32);
	});
	
	it("should return 5 strings when count is 5", async() => {
		const response = await request(app).get("/generateRandomString?count=5");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toHaveProperty("generatedString");
		expect(response.body.data.generatedString).toHaveLength(5);
	});
	
	it("should return an error when length is invalid", async() => {
		const response = await request(app).get("/generateRandomString?length=abc&count=1");
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["length"]);
	});
	
	it("should return an error when length is zero or negative", async() => {
		const response = await request(app).get("/generateRandomString?length=0&count=1");
		
		expect(response.ok).toBe(false);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["length"]);
	});
});