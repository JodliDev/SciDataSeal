import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import express from "express";
import request from "supertest";
import {mockKysely} from "../../convenience.ts";
import saveData from "../../../src/backend/routes/saveData.ts";
import supertest from "supertest";

describe("saveData", () => {
	vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
		default: vi.fn().mockReturnValue({saveMessage: () => ["signature"]}),
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
	app.use(saveData(mockDb));
	
	it("should return error if 'pass', 'questionnaireId' or data is missing using POST", async() => {
		const cases = [
			{query: {id: "testpassword"}, data: {column1: "content"}}, // Missing pass
			{query: {pass: "password123"}, data: {column1: "content"}}, // Missing id
			{query: {pass: "password123", id: "testpassword"}, data: {}}, // Missing data
			{query: {}, data:{}} // Missing everything
		];
		
		for(const testCase of cases) {
			const response = await supertest(app)
				.post("/saveData")
				.query(testCase.query)
				.send(testCase.data);
			
			expect(response.ok, `"With input ${JSON.stringify(testCase)}`).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorMissingData");
		}
	});
	
	it("should return error if 'pass', 'questionnaireId' or data is missing using GET", async() => {
		const cases = [
			{id: "1", data: "{\"column\":\"content\"}"}, // Missing pass
			{pass: "test-pass", data: "{\"column\":\"content\"}"}, // Missing id
			{id: "1", pass: "test-pass"}, // Missing data
			{} // Missing everything
		];
		
		for(const testCase of cases) {
			const response = await request(app)
				.get("/saveData")
				.query(testCase);
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorMissingData");
		}
	});
	
	it("should throw an error if pass has faulty characters", async() => {
		mockDb.selectFrom.chain()
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/saveData?id=1")
			.set("Authorization", "Bearer test$pass")
			.send({someKey: "someValue"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["apiPassword"]);
	});
	
	it("should throw an error if data is not an object", async() => {
		mockDb.selectFrom.chain()
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/saveData?id=1")
			.set("Authorization", "Bearer test-pass")
			.send(["data1", "data2"]);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["data"]);
	});
	
	it("should handle unauthorized access", async() => {
		mockDb.selectFrom.chain()
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/saveData?id=1")
			.set("Authorization", "Bearer test-pass")
			.send({someKey: "someValue"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	it("should throw error when 'questionnaire.columns' is missing", async() => {
		mockDb.selectFrom.chain()
			.executeTakeFirst.mockResolvedValue({
				questionnaireId: 1,
				columns: null,
			});
		
		const response = await request(app)
			.post("/saveData?id=1")
			.set("Authorization", "Bearer test-pass")
			.send({someKey: "someValue"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorQuestionnaireHasNoColumns");
	});
	
	it("should save data unsing POST", async() => {
		const questionnaireId = 1;
		const pass = "test-pass";
		const mockQuestionnaire = {
			blockchainType: "test-chain",
			privateKey: "test-key",
			columns: "\"key1\",\"key2\"",
			questionnaireId: 1,
			userId: 100,
		};
		
		mockDb.selectFrom.chain()
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.executeTakeFirst.mockResolvedValue(mockQuestionnaire);
		const insertMock = mockDb.insertInto.chain("DataLog").execute;
		
		const response = await request(app)
			.post(`/saveData?id=${questionnaireId}`)
			.set("Authorization", `Bearer ${pass}`)
			.send({key1: "value1", key2: "value2"});
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toStrictEqual({});
		expect(insertMock).toHaveBeenCalledTimes(1);
	});
	
	it("should save data using GET", async() => {
		const questionnaireId = 1;
		const pass = "test-pass";
		const mockQuestionnaire = {
			blockchainType: "test-chain",
			privateKey: "test-key",
			columns: "\"key1\",\"key2\"",
			questionnaireId: 1,
			userId: 100,
		};
		
		mockDb.selectFrom.chain()
			.where("questionnaireId", "=", questionnaireId)
			.where("apiPassword", "=", pass)
			.executeTakeFirst.mockResolvedValue(mockQuestionnaire);
		const insertMock = mockDb.insertInto.chain("DataLog").execute;
		
		const response = await request(app)
			.get(`/saveData?id=${questionnaireId}&pass=${pass}&data=${JSON.stringify({key1: "value1", key2: "value2"})}`)
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toStrictEqual({});
		expect(insertMock).toHaveBeenCalledTimes(1);
	});
});