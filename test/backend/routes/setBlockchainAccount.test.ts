import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import setBlockchainAccount from "../../../src/backend/routes/setBlockchainAccount.ts";
import {WalletData} from "../../../src/backend/blockchains/BlockchainInterface.ts";
import getBlockchain from "../../../src/backend/actions/getBlockchain.ts";


describe("setBlockchainAccount", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
		default: vi.fn().mockReturnValue({
			createWallet: () => ({
				mnemonic: "mnemonic",
				publicKey: "publicKey",
				privateKey: "privateKey"
			} satisfies WalletData)
		}),
	}));
	
	afterEach(() => {
		vi.clearAllMocks();
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", setBlockchainAccount(mockDb));
	
	it("should return error when required fields are missing", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return error when blockchainName is invalid", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Block%chain",
				blockchainType: "solana",
				mnemonic: "test",
			});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["blockchainName"]);
	});
	
	it("should return error when creating a new entry and blockchainType is missing", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Blockchain",
				mnemonic: "test",
			});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return error when creating a new entry and blockchainType is invalid", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Blockchain",
				blockchainType: "Faulty%",
				mnemonic: "test",
			});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["blockchainType"]);
	});
	
	it("should throw an error when useExisting is true but no mnemonic was provided", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Test Blockchain",
				blockchainType: "solana",
				useExisting: "1",
			});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should use existing mnemonic when useExisting is true", async() => {
		const createWalletMock = vi.fn();
		vi.mocked(getBlockchain).mockReturnValueOnce({
			createWallet: createWalletMock,
			saveMessage: vi.fn(),
			isConfirmed: vi.fn(),
			listData: vi.fn()
		});
		await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Test Blockchain",
				blockchainType: "solana",
				useExisting: "1",
				mnemonic: "mnemonic",
			});
		
		expect(createWalletMock).toHaveBeenCalledWith("mnemonic");
	});
	
	it("should create new wallet when useExisting is false", async() => {
		const createWalletMock = vi.fn();
		vi.mocked(getBlockchain).mockReturnValueOnce({
			createWallet: createWalletMock,
			saveMessage: vi.fn(),
			isConfirmed: vi.fn(),
			listData: vi.fn()
		})
		await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Test Blockchain",
				blockchainType: "solana",
				mnemonic: "shouldNotBeUsed",
			});
		
		expect(createWalletMock).toHaveBeenCalledWith();
	});
	
	it("should return error when mnemonic is invalid", async() => {
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send({
				blockchainName: "Test Blockchain",
				blockchainType: "solana",
				useExisting: "1",
				mnemonic: "Faulty%key",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["mnemonic"]);
	});
	
	it("should update an existing blockchain account successfully", async() => {
		const mockBlockchainAccount = {id: 123};
		const sendData = {
			id: 111,
			blockchainName: "Updated Blockchain",
		}
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", 111)
			.executeTakeFirst.mockResolvedValue(mockBlockchainAccount);
		
		const updateTableMock = mockDb.updateTable.chain("BlockchainAccount")
			.set.chain({
				blockchainName: sendData.blockchainName,
			})
			.where.chain("blockchainAccountId", "=", 111)
			.execute;
		
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send(sendData);
		
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.ok).toBe(true);
		expect(response.body.data).toHaveProperty("blockchainAccountId", 111);
	});
	
	it("should create a new blockchain account successfully", async() => {
		const newId = 456;
		const sendData = {
			blockchainName: "New Blockchain",
			blockchainType: "solana",
			mnemonic: "mnemonic",
		}
		
		const insertIntoMock = mockDb.insertInto.chain("BlockchainAccount")
			.values.chain({
				blockchainName: sendData.blockchainName,
				blockchainType: sendData.blockchainType,
				privateKey: "privateKey",
				publicKey: "publicKey",
				highestDenotation: 0,
			})
			.executeTakeFirst.mockResolvedValue({insertId: newId});
		
		const response = await request(app)
			.post("/setBlockchainAccount")
			.send(sendData);
		
		expect(response.ok, JSON.stringify(response.body)).toBe(true);
		expect(insertIntoMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("blockchainAccountId", newId);
	});
	
	it("should return unauthorized error for invalid account update attempt", async() => {
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/setBlockchainAccount")
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