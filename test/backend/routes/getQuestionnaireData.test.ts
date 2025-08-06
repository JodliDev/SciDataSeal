import {afterAll, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import getQuestionnaireData from "../../../src/backend/routes/getQuestionnaireData.ts";
import getBlockchain from "../../../src/backend/actions/authentication/getBlockchain.ts";
import BlockchainInterface from "../../../src/backend/blockchains/BlockchainInterface.ts";


describe("getQuestionnaireData", () => {
	vi.mock("../../../src/backend/actions/authentication/getBlockchain.ts", () => ({
		default: vi.fn()
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const app = express();
	app.use(express.json());
	app.use("/", getQuestionnaireData());
	
	it("should return CSV data for a valid GET request", async() => {
		const mockListData = vi.fn().mockResolvedValue([
			{isHeader: true, data: "Header", timestamp: ""},
			{isHeader: false, data: "Data1", timestamp: "123456"},
		]);
		vi.mocked(getBlockchain).mockReturnValue({listData: mockListData} as unknown as BlockchainInterface);
		
		const response = await request(app)
			.get("/getQuestionnaireData")
			.query({
				blockchainType: "testChain",
				publicKey: "testKey",
				denotation: 1,
				dataKey: "key",
			});
		
		expect(response.ok).toBe(true);
		expect(response.body.data.csv).toBe('"Time",Header\n"123456",Data1');
		expect(getBlockchain).toHaveBeenCalledWith("testChain");
		expect(mockListData).toHaveBeenCalledWith("testKey", 1, "key");
	});
	
	it("should return error for GET request with missing parameters", async() => {
		const response = await request(app)
			.get("/getQuestionnaireData")
			.query({
				blockchainType: "",
				publicKey: "testKey",
				denotation: 0,
				dataKey: "",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return CSV data for a valid POST request", async() => {
		const mockListData = vi.fn().mockResolvedValue([
			{isHeader: true, data: "Header", timestamp: ""},
			{isHeader: false, data: "Data1", timestamp: "123456"},
		]);
		vi.mocked(getBlockchain).mockReturnValue({listData: mockListData} as unknown as BlockchainInterface);
		
		const response = await request(app)
			.post("/getQuestionnaireData")
			.send({
				blockchainType: "testChain",
				publicKey: "testKey",
				denotation: 1,
				dataKey: "key",
			});
		
		expect(response.ok).toBe(true);
		expect(response.body.data.csv).toBe('"Time",Header\n"123456",Data1');
		expect(getBlockchain).toHaveBeenCalledWith("testChain");
		expect(mockListData).toHaveBeenCalledWith("testKey", 1, "key");
	});
	
	it("should return error for POST request with missing parameters", async() => {
		const response = await request(app)
			.post("/getQuestionnaireData")
			.send({
				blockchainType: "",
				publicKey: "testKey",
				denotation: 0,
				dataKey: "",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
});