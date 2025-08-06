import express from "express";
import request from "supertest";
import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import userSettings from "../../../src/backend/routes/userSettings.ts";
import encryptPassword from "../../../src/backend/actions/authentication/encryptPassword.ts";



describe("userSettings", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	vi.mock("../../../src/backend/actions/authentication/encryptPassword.ts", () => ({
		default: vi.fn()
	}));
	
	
	beforeEach(() => {
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(userSettings(mockDb));
	
	it("should update the user password successfully", async() => {
		const newPassword = "newPassword123";
		
		const updateMock = mockDb.updateTable.chain("User")
			.where.chain("userId", "=", 123)
			.executeTakeFirst
		
		const response = await request(app)
			.post("/userSettings")
			.send({newPassword});
		
		expect(response.ok).toBe(true);
		expect(updateMock).toHaveBeenCalledOnce();
		expect(encryptPassword).toHaveBeenCalledWith(newPassword);
	});
	
	it("should return error if newPassword is missing", async() => {
		const response = await request(app).post("/userSettings").send({});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
});