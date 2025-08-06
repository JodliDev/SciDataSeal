import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import deleteUser from "../../../src/backend/routes/deleteUser.ts";
import {mockKysely} from "../../convenience.ts";

describe("deleteUser", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	
	afterEach(() => {
		mockDb.resetMocks();
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(deleteUser(mockDb));
	
	it("should throw an error if 'id' is missing", async() => {
		const response = await request(app).post("/deleteUser").send({});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should throw an error if trying to delete the current logged-in user", async() => {
		const response = await request(app)
			.post("/deleteUser")
			.send({id: "123"});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorCannotDeleteYourself");
	});
	
	it("should delete the user successfully if valid 'id' is provided", async() => {
		const response = await request(app)
			.post("/deleteUser")
			.send({id: "456"});
		
		expect(response.ok).toBe(true);
		expect(mockDb.deleteFrom).toHaveBeenCalledWith("User");
		expect(mockDb.where).toHaveBeenCalledWith("userId", "=", "456");
	});
});