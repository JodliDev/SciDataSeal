import {afterEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import getEntry from "../../../src/backend/routes/getEntry.ts";
import {getLoggedInSessionData} from "../../../src/backend/actions/authentication/getSessionData.ts";
import {mockKysely} from "../../MockKysely.ts";

describe("getEntry route", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn(() => ({userId: 123}))
	}));
	
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", getEntry(mockDb));
	
	const mockData = {
		someId: 5,
		someKey: "someValue"
	};
	
	it("should return error when no id is provided", async() => {
		const response = await request(app)
			.get("/getEntry")
			.query({})
			.send();
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return error when a faulty type is provided", async() => {
		const response = await request(app)
			.get("/getEntry")
			.query({id: 5, type: "doesNotExist"})
			.send();
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["type"]);
	});
	
	it("should return error when no data was not found", async() => {
		mockDb.selectFrom.chain()
			.executeTakeFirst.mockResolvedValueOnce(null);
		
		const response = await request(app)
			.get("/getEntry")
			.query({id: "1", type: "study"})
			.send();
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
	
	
	describe("BlockchainAccount", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return an error if not an admin", async() => {
			const queryData = {id: "1", type: "blockchainAccount"};
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
		});
		
		it("should return data for valid id", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			
			const queryData = {id: "1", type: "blockchainAccount"};
			
			mockDb.selectFrom.chain("BlockchainAccount")
				.where.chain("blockchainAccountId", "=", parseInt(queryData.id))
				.executeTakeFirst.mockResolvedValueOnce(mockData);
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok, JSON.stringify(response.body)).toBe(true);
			expect(response.body.data, JSON.stringify(response.body)).toEqual(mockData);
			
			//cleanup:
			vi.mocked(getLoggedInSessionData).mockReset();
		});
	});
	
	describe("Questionnaire", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return data for valid id", async() => {
			const queryData = {id: "1", type: "questionnaire"};
			
			mockDb.selectFrom.chain("Questionnaire")
				.where.chain("questionnaireId", "=", parseInt(queryData.id))
				.where.chain("userId", "=", 123)
				.executeTakeFirst.mockResolvedValueOnce(mockData);
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok, JSON.stringify(response.body)).toBe(true);
			expect(response.body.data, JSON.stringify(response.body)).toEqual(mockData);
		});
	});
	
	describe("Study", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return data for valid id", async() => {
			const queryData = {id: "1", type: "study"};
			
			mockDb.selectFrom.chain("Study")
				.where.chain("studyId", "=", parseInt(queryData.id))
				.where.chain("userId", "=", 123)
				.executeTakeFirst.mockResolvedValueOnce(mockData);
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok, JSON.stringify(response.body)).toBe(true);
			expect(response.body.data, JSON.stringify(response.body)).toEqual(mockData);
		});
	});
	
	describe("user", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return an error if not an admin", async() => {
			const queryData = {id: "1", type: "user"};
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
		});
		
		it("should return data for valid id", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			
			const queryData = {id: "1", type: "user"};
			
			mockDb.selectFrom.chain("User")
				.where.chain("userId", "=", parseInt(queryData.id))
				.executeTakeFirst.mockResolvedValueOnce(mockData);
			
			const response = await request(app)
				.get("/getEntry")
				.query(queryData)
				.send();
			
			expect(response.ok, JSON.stringify(response.body)).toBe(true);
			expect(response.body.data, JSON.stringify(response.body)).toEqual(mockData);
			
			//cleanup:
			vi.mocked(getLoggedInSessionData).mockReset();
		});
	});
	
});