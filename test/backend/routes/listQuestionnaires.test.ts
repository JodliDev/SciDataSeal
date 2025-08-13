import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import listQuestionnaires from "../../../src/backend/routes/listQuestionnaires.ts";

describe("listQuestionnaires", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
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
	app.use(listQuestionnaires(mockDb));
	
	
	it("should return a list of all questionnaires for the logged-in user", async() => {
		const mockList = [
			{questionnaireId: 1, questionnaireName: "Test 1"},
			{questionnaireId: 2, questionnaireName: "Test 2"},
		];
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("userId", "=", 123)
			.execute.mockResolvedValue(mockList);
		
		const response = await request(app)
			.get("/listQuestionnaires");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({questionnaires: mockList});
	});
	
	it("should return a list of questionnaires for the logged-in user and the provided study", async() => {
		const studyId = 7;
		const mockList = [
			{questionnaireId: 1, questionnaireName: "Test 1"},
			{questionnaireId: 2, questionnaireName: "Test 2"},
		];
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("studyId", "=", studyId)
			.where.chain("userId", "=", 123)
			.execute.mockResolvedValue(mockList);
		
		const response = await request(app)
			.get(`/listQuestionnaires?studyId=${studyId}`);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({questionnaires: mockList});
	});
	
	it("should return an empty list if no questionnaires are found", async() => {
		mockDb.selectFrom.chain("Questionnaire")
			.where.chain("userId", "=", 123)
			.execute.mockResolvedValue([]);
		
		const response = await request(app)
			.get("/listQuestionnaires");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({questionnaires: []});
	});
});