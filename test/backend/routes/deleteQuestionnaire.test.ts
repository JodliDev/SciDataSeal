import {afterEach, describe, expect, it} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import deleteQuestionnaire from "../../../src/backend/routes/deleteQuestionnaire.ts";

describe("deleteQuestionnaire", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(deleteQuestionnaire(mockDb));
	
	it("should delete a questionnaire when valid ID is provided", async() => {
		const response = await request(app).post("/deleteQuestionnaire").send({id: 1});
		expect(response.status).toBe(200);
		expect(mockDb.deleteFrom).toHaveBeenCalledWith("Questionnaire");
		expect(mockDb.where).toHaveBeenCalledWith("questionnaireId", "=", 1)
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.deleteFrom).toHaveBeenCalled();
	});
	
	it("should return an error when id is missing", async() => {
		const response = await request(app).post("/deleteQuestionnaire").send({});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
		expect(mockDb.deleteFrom).not.toHaveBeenCalled();
	});
});