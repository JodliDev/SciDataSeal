import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import setQuestionnaireColumns from "../../../src/backend/routes/setQuestionnaireColumns.ts";
import express from "express";
import {mockKysely} from "../../convenience.ts";


describe("setQuestionnaireColumns", () => {
	vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
		default: vi.fn(() => ({
			saveMessage: vi.fn(() => Promise.resolve(["someSignature"]))
		})),
	}));
	vi.mock("../../../src/backend/actions/compressAndEncrypt.ts", () => ({
		compressAndEncrypt: vi.fn(() => "encrypted"),
	}));
	
	beforeEach(() => {
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(setQuestionnaireColumns(mockDb));
	
	it("should return errorMissingData if data is missing in POST route", async() => {
		const response = await request(app).post("/setQuestionnaireColumns").send({});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should also accept an Authorization header in POST route", async() => {
		const questionnaireId = 1;
		const pass = "dGVzdDp0ZXN0";
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("questionnaireId", "=", questionnaireId)
			.where.chain("apiPassword", "=", pass)
			.executeTakeFirst.mockResolvedValue({columns: "\"asd\",\"qwe\""});
		
		const response = await request(app)
			.post(`/setQuestionnaireColumns?id=${questionnaireId}`)
			.set("Authorization", `Bearer ${pass}`)
			.send({columns: ["asd", "qwe"]});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(true);
	});
	
	it("should return errorFaultyData if pass has invalid characters", async() => {
		const response = await request(app).post("/setQuestionnaireColumns?id=1&pass=q$we").send({columns: []});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["apiPassword"]);
	});
	
	it("should return errorFaultyData if column is not an array", async() => {
		const response = await request(app).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: "qwe"});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["columns"]);
	});
	
	it("should return errorFaultyData if a column entry has invalid characters", async() => {
		const response = await request(app).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: ["asd", "qw$e"]});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["columns"]);
	});
	
	it("should return early if columns is identical to questionnaire.columns", async() => {
		mockDb.selectFrom.chain("Questionnaire")
			.executeTakeFirst.mockResolvedValue({columns: "[\"asd\",\"qwe\"]"});
		
		const response = await request(app).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: ["asd", "qwe"]});
		
		expect(response.ok, JSON.stringify(response.body)).toBe(true);
	});
	
	it("should return an error if questionnaire apiPassword is not valid", async() => {
		const questionnaireMock = mockDb.selectFrom.chain("Questionnaire")
			.where.chain("questionnaireId", "=", 1)
			.where.chain("apiPassword", "=", "wrongPassword")
			.executeTakeFirst;
		
		questionnaireMock.mockResolvedValue(null);
		
		const response = await request(app).post("/setQuestionnaireColumns?id=1&pass=wrongPassword").send({columns: ["asd", "qwe"]});
		
		expect(questionnaireMock).toHaveBeenCalled();
		expect(response.ok, JSON.stringify(response.body)).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	
	it("should save the correct values", async() => {
		const mockDate = new Date("03.04.2024 02:38 UTC")
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
		
		const userId = 123;
		const questionnaireId = 1;
		const pass = "qwe";
		
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("questionnaireId", "=", questionnaireId)
			.where.chain("apiPassword", "=", pass)
			.executeTakeFirst.mockResolvedValue({columns: "\"asd\"", userId: userId});
		
		const insertMock = mockDb.insertInto.chain("DataLog")
			.execute;
		
		const updateMock = mockDb.updateTable.chain("Questionnaire")
			.set.chain({"columns": "[\"asd\",\"qwe\"]"})
			.where.chain("questionnaireId", "=", questionnaireId)
			.execute;
		
		const res = await request(app).post(`/setQuestionnaireColumns?id=${questionnaireId}&pass=${pass}`).send({columns: ["asd", "qwe"]});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("ok", true);
		expect(insertMock).toHaveBeenCalled();
		expect(updateMock).toHaveBeenCalled();
		
		vi.useRealTimers();
	});
});