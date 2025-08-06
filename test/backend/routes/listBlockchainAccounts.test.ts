import {afterEach, describe, expect, it} from "vitest";
import supertest from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import listBlockchainAccounts from "../../../src/backend/routes/listBlockchainAccounts.ts";

describe("listBlockchainAccounts", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(listBlockchainAccounts(mockDb));
	
	it("should return a list of blockchain accounts", async() => {
		const mockList = [
			{blockchainAccountId: 1, blockchainName: "solana"},
			{blockchainAccountId: 2, blockchainName: "solanaDev"},
		];
		mockDb.selectFrom.chain("BlockchainAccount")
			.execute.mockResolvedValue(mockList);
		
		const response = await supertest(app).get("/listBlockchainAccounts");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({accounts: mockList});
	});
	
	it("should return an empty list if no accounts are found", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.execute.mockResolvedValue([]);
		
		const response = await supertest(app).get("/listBlockchainAccounts");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({accounts: []});
	});
});