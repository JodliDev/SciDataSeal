import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import express from "express";
import supertest from "supertest";
import {mockKysely} from "../../convenience.ts";
import initialize from "../../../src/backend/routes/initialize.ts";
import {Options} from "../../../src/backend/Options.ts";

describe("initialize", () => {
	vi.mock("../../../src/shared/FrontendOptions.ts", () => ({
		recreateOptionsString: vi.fn()
	}));
	
	afterEach(() => {
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", initialize(mockDb));
	
	
	it("should add a new admin user and return the user id", async() => {
		Options.isInit = false;
		const mockInsert = mockDb.insertInto.chain("User")
			.executeTakeFirst.mockResolvedValue({insertId: 1});
		
		const response = await supertest(app)
			.post("/initialize")
			.send({username: "testuser", password: "testpassword"});
		
		expect(mockInsert).toHaveBeenCalled();
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({userId: 1});
	});

	it("should return an error if Options.isInit is true", async () => {
		Options.isInit = true;
		
		const response = await supertest(app)
			.post("/initialize")
			.send({username: "testuser", password: "testpassword"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	it("should return an error if username or password is missing", async() => {
		Options.isInit = false;
		const cases = [
			{username: "", password: "testpassword"}, // Missing username
			{username: "testuser", password: ""}, // Missing password
			{} // Missing both fields
		];
		
		for(const testCase of cases) {
			const response = await supertest(app)
				.post("/initialize")
				.send(testCase);
			
			expect(response.ok, `"With input ${JSON.stringify(testCase)}`).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorMissingData");
		}
	});
});