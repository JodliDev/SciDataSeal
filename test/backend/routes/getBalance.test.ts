import {describe, expect, it, vi} from "vitest";
import express from "express";
import request from "supertest";
import getBalance from "../../../src/backend/routes/getBalance.ts";
import {mockKysely} from "../../MockKysely.ts";

vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
	default: vi.fn((blockchainType) => ({
		getBalance: vi.fn().mockResolvedValue(blockchainType === "validType" ? 1000 : 0)
	})),
}));


describe("getBalance", () => {
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", getBalance(mockDb));
	
	it("should return the balance for a valid blockchain account ID", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValueOnce({
				blockchainType: "validType",
				publicKey: "validPublicKey",
			});
		
		const response = await request(app)
			.get("/getBalance")
			.query({blockchainAccountId: "1"})
			.send();
		
		expect(response.ok, JSON.stringify(response.body)).toBe(true);
		expect(response.body.data).toEqual({balance: 1000});
	});
	
	it("should handle missing blockchain account data in the database", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValueOnce(null);
		
		const response = await request(app)
			.get("/getBalance")
			.query({blockchainAccountId: "2"})
			.send();
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["blockchainAccountId"]);
	});
});