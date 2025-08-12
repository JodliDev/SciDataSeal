import {afterAll, afterEach, describe, expect, it, test, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import deleteEntry from "../../../src/backend/routes/deleteEntry.ts";
import {getLoggedInSessionData} from "../../../src/backend/actions/authentication/getSessionData.ts";

describe("deleteEntry", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn(() => ({userId: 123}))
	}));
	
	afterEach(() => {
		mockDb.resetMocks();
		vi.restoreAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(deleteEntry(mockDb));
	
	it("should throw an error if 'id' is missing", async() => {
		const response = await request(app)
			.post("/deleteEntry")
			.send({type: "user"});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should throw an error if 'type' is faulty", async() => {
		const response = await request(app)
			.post("/deleteEntry")
			.send({id: "234", type: "wrongInput"});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	
	describe("user", () => {
		afterEach(() => {
			mockDb.resetMocks();
			vi.restoreAllMocks();
		});
		
		test("should return error if user is not an admin", async() => {
			mockDb.executeTakeFirst.mockResolvedValueOnce({id: 1});
			
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "123", type: "user"});
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
			expect(mockDb.deleteFrom).not.toHaveBeenCalled();
		});
		
		it("should throw an error if trying to delete the current logged-in user", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "123", type: "user"});
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorCannotDeleteYourself");
		});
		
		it("should delete the user successfully", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "456", type: "user"});
			
			expect(response.ok).toBe(true);
			expect(mockDb.deleteFrom).toHaveBeenCalledWith("User");
			expect(mockDb.where).toHaveBeenCalledWith("userId", "=", "456");
		});
	});
	
	describe("questionnaire", () => {
		afterEach(() => {
			mockDb.resetMocks();
			vi.restoreAllMocks();
		});
		
		it("should delete the questionnaire successfully", async() => {
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "456", type: "questionnaire"});
			
			expect(response.ok).toBe(true);
			expect(mockDb.deleteFrom).toHaveBeenCalledWith("Questionnaire");
			expect(mockDb.where).toHaveBeenCalledWith("questionnaireId", "=", "456");
		});
	});
	
	describe("deleteBlockchainAccount", () => {
		afterEach(() => {
			mockDb.resetMocks();
			vi.restoreAllMocks();
		});
		
		test("should return error if user is not an admin", async() => {
			mockDb.executeTakeFirst.mockResolvedValueOnce({id: 1});
			
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "123", type: "blockchainAccount"});
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
			expect(mockDb.deleteFrom).not.toHaveBeenCalled();
		});
		
		test("should return error if user has existing questionnaires", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			mockDb.executeTakeFirst.mockResolvedValueOnce({id: 1});
			
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "123", type: "blockchainAccount"});
			
			expect(response.ok).toBe(false);
			expect(response.body.error).toHaveProperty("message", "errorMustDeleteAllQuestionnaires");
			expect(mockDb.deleteFrom).not.toHaveBeenCalled();
		});
		
		it("should delete the questionnaire successfully", async() => {
			vi.mocked(getLoggedInSessionData).mockResolvedValue({wasAuthenticated: true, isLoggedIn: true, userId: 123, isAdmin: true});
			const response = await request(app)
				.post("/deleteEntry")
				.send({id: "456", type: "blockchainAccount"});
			
			expect(response.ok).toBe(true);
			expect(mockDb.deleteFrom).toHaveBeenCalledWith("BlockchainAccount");
			expect(mockDb.where).toHaveBeenCalledWith("blockchainAccountId", "=", "456");
		});
	});
});