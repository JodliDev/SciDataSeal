import {beforeEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import setQuestionnaireColumns from "../../../src/backend/routes/setQuestionnaireColumns.ts";
import express from "express";
import {DbType} from "../../../src/backend/database/setupDb.ts";

vi.mock("../../../src/backend/actions/authentication/getBlockchain.ts", () => ({
	default: vi.fn(() => ({
		saveMessage: vi.fn(() => Promise.resolve(["someSignature"]))
	})),
}));

class MockKysely {
	public readonly mocks = {
		selectFrom: vi.fn(),
		select: vi.fn(),
		insertInto: vi.fn(),
		values: vi.fn(),
		updateTable: vi.fn(),
		set: vi.fn(),
		where: vi.fn(),
		limit: vi.fn(),
		executeTakeFirst: vi.fn(),
		execute: vi.fn()
	}
	public readonly returnMocks = {
		executeTakeFirst: null as any,
		execute: null as any,
	}
	
	public resetMocks() {
		this.returnMocks.executeTakeFirst = null;
		this.returnMocks.execute = null;
		for(const key in this.mocks) {
			this.mocks[key as keyof typeof this.mocks].mockReset();
		}
	}
	
	public selectFrom(table: string) {
		this.mocks.selectFrom(table);
		return this;
	}
	public select(table: string) {
		this.mocks.select(table);
		return this;
	}
	public insertInto(table: string) {
		this.mocks.insertInto(table);
		return this;
	}
	public values(table: string) {
		this.mocks.values(table);
		return this;
	}
	public updateTable(table: string) {
		this.mocks.updateTable(table);
		return this;
	}
	public set(table: string) {
		this.mocks.set(table);
		return this;
	}
	public where(table: string) {
		this.mocks.where(table);
		return this;
	}
	public limit(table: string) {
		this.mocks.limit(table);
		return this;
	}
	public executeTakeFirst(table: string) {
		this.mocks.executeTakeFirst(table);
		return this.returnMocks.executeTakeFirst;
	}
	public execute(table: string) {
		this.mocks.execute(table);
		return this.returnMocks.execute;
	}
}

describe("setQuestionnaireColumns", () => {
	const mockDb = new MockKysely();
	
	const mockRouter = setQuestionnaireColumns(mockDb as unknown as DbType);
	const mockApp = express();
	mockApp.use(express.json());
	mockApp.use(mockRouter);
	
	beforeEach(() => {
		mockDb.resetMocks();
	});
	
	it("should return errorMissingData if data is missing in GET route", async() => {
		const res = await request(mockApp).get("/setQuestionnaireColumns");
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should also accept an Authorization header in GET route", async() => {
		mockDb.returnMocks.executeTakeFirst = {columns: "[\"asd\",\"qwe\"]"};
		const res = await request(mockApp)
			.get("/setQuestionnaireColumns?id=1&columns=[\"asd\",\"qwe\"]")
			.set("Authorization", "Basic dGVzdDp0ZXN0");
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("ok", true);
	});
	
	it("should return errorMissingData if data is missing in POST route", async() => {
		const res = await request(mockApp).post("/setQuestionnaireColumns").send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should also accept an Authorization header in POST route", async() => {
		mockDb.returnMocks.executeTakeFirst = {columns: "[\"asd\",\"qwe\"]"};
		const res = await request(mockApp)
			.post("/setQuestionnaireColumns?id=1")
			.set("Authorization", "Basic dGVzdDp0ZXN0")
			.send({columns: ["asd", "qwe"]});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("ok", true);
	});
	
	it("should return errorFaultyData if pass has invalid characters", async() => {
		const res = await request(mockApp).post("/setQuestionnaireColumns?id=1&pass=q$we").send({columns: []});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toHaveProperty("message", "errorFaultyData");
		expect(res.body.error).toHaveProperty("values", ["apiPassword"]);
	});
	
	it("should return errorFaultyData if column is not an array", async() => {
		const res = await request(mockApp).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: "qwe"});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toHaveProperty("message", "errorFaultyData");
		expect(res.body.error).toHaveProperty("values", ["columns"]);
	});
	
	it("should return errorFaultyData if a column entry has invalid characters", async() => {
		const res = await request(mockApp).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: ["asd", "qw$e"]});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toHaveProperty("message", "errorFaultyData");
		expect(res.body.error).toHaveProperty("values", ["columns"]);
	});
	
	it("should return early if columns is identical to questionnaire.columns", async() => {
		mockDb.returnMocks.executeTakeFirst = {columns: "[\"asd\",\"qwe\"]"};
		const res = await request(mockApp).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: ["asd", "qwe"]});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("ok", true);
	});
	
	
	it("should save the correct values", async() => {
		mockDb.returnMocks.executeTakeFirst = {columns: "[\"asd\"]"};
		const res = await request(mockApp).post("/setQuestionnaireColumns?id=1&pass=qwe").send({columns: ["asd", "qwe"]});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("ok", true);
		expect(mockDb.mocks.insertInto).toHaveBeenCalledWith("DataLog");
		expect(mockDb.mocks.values).toHaveBeenCalledWith({questionnaireId: 1, signature: "[\"someSignature\"]"});
		expect(mockDb.mocks.updateTable).toHaveBeenCalledWith("Questionnaire");
		expect(mockDb.mocks.set).toHaveBeenCalledWith({columns: "[\"asd\",\"qwe\"]"});
	});
});