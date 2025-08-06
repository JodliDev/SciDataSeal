import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import editBlockchainAccount from "../../../src/backend/routes/editBlockchainAccount.ts";


describe("editBlockchainAccount", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
		default: vi.fn().mockReturnValue({getPublicKey: () => "test-public-key"}),
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", editBlockchainAccount(mockDb));
	
	it("should return error when required fields are missing", async() => {
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send({});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return error for invalid blockchainName", async() => {
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send({
				blockchainName: "Block%chain",
				blockchainType: "solana",
				privateKey: "test-private-key",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["blockchainName"]);
	});
	
	it("should return error for invalid privateKey", async() => {
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send({
				blockchainName: "Test Blockchain",
				blockchainType: "solana",
				privateKey: "Faulty%key",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["privateKey"]);
	});
	
	it("should update an existing blockchain account successfully", async() => {
		const mockBlockchainAccount = {id: 123};
		const sendData = {
			id: 111,
			blockchainName: "Updated Blockchain",
			blockchainType: "solanaTest",
			privateKey: "a".repeat(64),
		}
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", 111)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue(mockBlockchainAccount);
		
		const updateTableMock = mockDb.updateTable.chain("BlockchainAccount")
			.set.chain({
				blockchainName: sendData.blockchainName,
				blockchainType: sendData.blockchainType,
				privateKey: sendData.privateKey,
				publicKey: "test-public-key",
			})
			.where.chain("blockchainAccountId", "=", 111)
			.execute;
		
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send(sendData);
		
		expect(mockDb.updateTable).toHaveBeenCalledWith("BlockchainAccount");
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.ok).toBe(true);
		expect(response.body.data).toHaveProperty("blockchainAccountId", 111);
	});
	
	it("should create a new blockchain account successfully", async() => {
		const newId = 456;
		const sendData = {
			blockchainName: "New Blockchain",
			blockchainType: "solana",
			privateKey: "new-private-key",
		}
		
		const insertIntoMock = mockDb.insertInto.chain("BlockchainAccount")
			.values.chain({
				userId: 123,
				blockchainName: sendData.blockchainName,
				blockchainType: sendData.blockchainType,
				privateKey: sendData.privateKey,
				publicKey: "test-public-key",
				highestDenotation: 0,
			})
			.executeTakeFirst.mockResolvedValue({insertId: newId});
		
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(insertIntoMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("blockchainAccountId", newId);
	});
	
	it("should return unauthorized error for invalid account update attempt", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/editBlockchainAccount")
			.send({
				id: 999,
				blockchainName: "Invalid Update",
				blockchainType: "ethereum",
				privateKey: "invalid-private-key",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
});