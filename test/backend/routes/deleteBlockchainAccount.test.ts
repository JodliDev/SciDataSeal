import {afterEach, describe, expect, test} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import deleteBlockchainAccount from "../../../src/backend/routes/deleteBlockchainAccount.ts";

describe("deleteBlockchainAccount", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(deleteBlockchainAccount(mockDb));
	
	test("should return error if data.id is missing", async() => {
		const response = await request(app)
			.post("/deleteBlockchainAccount")
			.send({});
		
		expect(response.body.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
		expect(mockDb.deleteFrom).not.toHaveBeenCalled();
	});
	
	test("should return error if user has existing questionnaires", async() => {
		mockDb.executeTakeFirst.mockResolvedValueOnce({id: 1});
		
		const response = await request(app)
			.post("/deleteBlockchainAccount")
			.send({id: "123"});
		
		expect(response.body.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMustDeleteAllQuestionnaires");
		expect(mockDb.selectFrom).toHaveBeenCalledWith("Questionnaire");
		expect(mockDb.where).toHaveBeenCalledWith("userId", "=", "123");
		expect(mockDb.deleteFrom).not.toHaveBeenCalled();
	});
	
	test("should delete questionnaire if no related questionnaires exists", async() => {
		mockDb.executeTakeFirst.mockResolvedValueOnce(undefined);
		
		const response = await request(app)
			.post("/deleteBlockchainAccount")
			.send({id: "123"});
		
		expect(response.status).toBe(200);
		expect(mockDb.deleteFrom).toHaveBeenCalledWith("Questionnaire");
		expect(mockDb.where).toHaveBeenCalledWith("questionnaireId", "=", "123");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.deleteFrom).toHaveBeenCalled();
	});
});