import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import getBlockchainAccount from "../../../src/backend/routes/getBlockchainAccount.ts";

// Mock dependencies

describe("getBlockchainAccount", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
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
	app.use("/", getBlockchainAccount(mockDb))
	
	it("should return blockchain account data for a valid request", async() => {
		const mockAccount = {
			blockchainName: "Solana",
			blockchainType: "solana",
			privateKey: "mockPrivateKey",
			publicKey: "mockPublicKey",
			highestDenotation: "BTC",
		};
		const sendData = {
			accountId: "5",
		};
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("userId", "=", 123)
			.where.chain("blockchainAccountId", "=", parseInt(sendData.accountId))
			.executeTakeFirst.mockResolvedValue(mockAccount);
		
		const response = await request(app).get("/getBlockchainAccount").query(sendData);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({
			blockchainAccountId: parseInt(sendData.accountId),
			...mockAccount
		});
		expect(mockDb.selectFrom).toHaveBeenCalledOnce();
	});
	
	it("should return an error when blockchain account does not exist", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app).get("/getBlockchainAccount").query({
			accountId: "5",
		});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
	
	it("should return an error for invalid accountId", async() => {
		const response = await request(app).get("/getBlockchainAccount").query({
			accountId: "invalid",
		});
		
		expect(response.ok).toBe(false);
	});
});