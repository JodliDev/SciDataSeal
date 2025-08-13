import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import listStudies from "../../../src/backend/routes/listStudies.ts";

describe("listUsers", () => {
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
	app.use(listStudies(mockDb));
	
	
	it("should return a list of all studies", async() => {
		const mockList = [
			{studyId: 1, studyName: "Test 1"},
			{studyId: 2, studyName: "Test 2"},
		];
		mockDb.selectFrom.chain("Study")
			.where.chain("userId", "=", 123)
			.execute.mockResolvedValue(mockList);
		
		const response = await request(app)
			.get("/listStudies");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({studies: mockList});
	});
	
	it("should return an empty list if no studies are found", async() => {
		mockDb.selectFrom.chain("Study")
			.execute.mockResolvedValue([]);
		
		const response = await request(app)
			.get("/listStudies");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({studies: []});
	});
});