import {afterAll, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import getQuestionnaire from "../../../src/backend/routes/getQuestionnaire.ts";


describe("getQuestionnaire", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	
	const app = express();
	app.use(express.json());
	app.use(getQuestionnaire(mockDb));
	
	it("should return the questionnaire data for a valid request", async() => {
		const queryData = {questionnaireId: "1"};
		const mockQuestionnaire = {
			questionnaireId: 1,
			studyId: 99,
			questionnaireName: "Sample Questionnaire",
			blockchainDenotation: "ET",
			blockchainAccountId: "0x123456789",
			apiPassword: "password123",
			dataKey: "key123",
			columns: ["col1", "col2"],
		};
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("userId", "=", 123)
			.where.chain("questionnaireId", "=", parseInt(queryData.questionnaireId))
			.executeTakeFirst.mockResolvedValueOnce(mockQuestionnaire);
		
		const response = await request(app)
			.get("/getQuestionnaire")
			.query({questionnaireId: "1"});
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual(mockQuestionnaire);
	});
	
	it("should return an error when questionnaire is not found", async() => {
		mockDb.selectFrom.chain("Questionnaire")
			.executeTakeFirst.mockResolvedValueOnce(null);
		
		const response = await request(app)
			.get("/getQuestionnaire")
			.query({questionnaireId: "999"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
});