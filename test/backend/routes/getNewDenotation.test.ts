import {afterAll, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import getNewDenotation from "../../../src/backend/routes/getNewDenotation.ts";
import {mockKysely} from "../../convenience.ts";

describe("getNewDenotation", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use("/api", getNewDenotation(mockDb));
	
	it("should return the new denotation when provided with valid data", async() => {
		const sendData = {blockchainAccountId: "2"};
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", parseInt(sendData.blockchainAccountId))
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({highestDenotation: 5});
		
		const response = await request(app)
			.get("/api/getNewDenotation")
			.query(sendData);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({denotation: 6});
	});
	
	it("should throw error when blockchainAccountId is missing", async() => {
		const response = await request(app).get("/api/getNewDenotation");
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should throw error when blockchainAccountId is invalid", async() => {
		const response = await request(app)
			.get("/api/getNewDenotation")
			.query({blockchainAccountId: "invalid"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should throw error when the account is not found", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.get("/api/getNewDenotation")
			.query({blockchainAccountId: "2"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
});