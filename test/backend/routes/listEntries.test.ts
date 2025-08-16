import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import listEntries from "../../../src/backend/routes/listEntries.ts";
import {getLoggedInSessionData} from "../../../src/backend/actions/authentication/getSessionData.ts";
import {ListDefinitions} from "../../../src/shared/data/ListEntriesInterface.ts";
import {KyselyTables} from "../../../src/backend/database/DatabaseConfigs.ts";
import {ComparisonOperatorExpression} from "kysely";

describe("listEntries", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn(() => ({userId: 123}))
	}));
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	async function testResult(
		type: keyof ListDefinitions,
		table: keyof KyselyTables,
		where?: [string, ComparisonOperatorExpression, unknown][],
		query?: Record<string, string>
	) {
		const mockList = [
			{id: 1, label: "Test 1"},
			{id: 2, label: "Test 2"},
		];
		let chain = mockDb.selectFrom.chain(table);
		where?.forEach(args => {
			chain = chain.where.chain(...args);
		});
		chain.execute.mockResolvedValue(mockList);
		
		const response = await request(app)
			.get("/listEntries")
			.query({
				type: type,
				...query
			});
		
		const message = `Testing type ${type} with query ${JSON.stringify(query)}\nRespond: ${JSON.stringify(response.body)}`;
		expect(response.ok, message).toBe(true);
		expect(response.body.data, message).toEqual({list: mockList, totalCount: 0});
	}
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(listEntries(mockDb));
	
	
	it("should return error if type is missing", async() => {
		const response = await request(app)
			.get("/listEntries")
			.query({});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	it("should return error if type is unknown", async() => {
		const response = await request(app)
			.get("/listEntries")
			.query({
				type: "doesNotExist",
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["type"]);
	});
	
	describe("users", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return an error if not admin", async() => {
			const response = await request(app)
				.get("/listEntries")
				.query({
					type: "users"
				});
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
		});
		
		it("should return a list of all users", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({
				wasAuthenticated: true,
				isLoggedIn: true,
				isAdmin: true,
				userId: 123
			});
			
			await testResult("users", "User");
			
			//cleanup:
			vi.mocked(getLoggedInSessionData).mockRestore();
		});
	});
	
	describe("studies", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return a list of all studies", async() => {
			await testResult("studies", "Study");
		});
	});
	
	describe("dataLogs", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return a list of all studies", async() => {
			await testResult("dataLogs", "DataLog");
		});
	});
	
	describe("questionnaires", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return a list of all questionnaires for the logged-in user", async() => {
			await testResult("questionnaires", "Questionnaire", [["userId", "=", 123]]);
		});
		
		it("should return a list of questionnaires for the logged-in user and the provided study", async() => {
			await testResult(
				"questionnaires",
				"Questionnaire",
				[["studyId", "=", 7], ["userId", "=", 123]],
				{studyId: "7"}
			);
		});
	});
	
	describe("blockchainAccounts", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should return a list of all studies", async() => {
			await testResult("blockchainAccounts", "BlockchainAccount");
		});
	});
	
});