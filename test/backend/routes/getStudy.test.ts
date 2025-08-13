import {afterAll, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import getStudy from "../../../src/backend/routes/getStudy.ts";


describe("getStudy", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	
	const app = express();
	app.use(express.json());
	app.use(getStudy(mockDb));
	
	it("should return the study data for a valid request", async() => {
		const queryData = {studyId: "1"};
		const mockStudy = {
			studyId: 1,
			studyName: "Sample",
			apiPassword: "superSave",
			blockchainAccountId: 67,
		};
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", mockStudy.studyId)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValueOnce(mockStudy);
		
		const response = await request(app)
			.get("/getStudy")
			.query(queryData);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual(mockStudy);
	});
	
	it("should return an error when study is not found", async() => {
		mockDb.selectFrom.chain("Study")
			.executeTakeFirst.mockResolvedValueOnce(null);
		
		const response = await request(app)
			.get("/getStudy")
			.query({questionnaireId: "999"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
});