import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import listUsers from "../../../src/backend/routes/listUsers.ts";

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
	app.use(listUsers(mockDb));
	
	
	it("should return a list of all users", async() => {
		const mockList = [
			{userId: 1, username: "Test 1"},
			{userId: 2, username: "Test 2"},
		];
		mockDb.selectFrom.chain("User")
			.execute.mockResolvedValue(mockList);
		
		const response = await request(app)
			.get("/listUsers");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({users: mockList});
	});
	
	it("should return an empty list if no users are found", async() => {
		mockDb.selectFrom.chain("User")
			.execute.mockResolvedValue([]);
		
		const response = await request(app)
			.get("/listUsers");
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual({users: []});
	});
});