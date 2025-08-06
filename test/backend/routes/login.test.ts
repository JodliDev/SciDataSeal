import {afterEach, describe, expect, it} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import login from "../../../src/backend/routes/login.ts";
import encryptPassword from "../../../src/backend/actions/authentication/encryptPassword.ts";

type MockResult = {
	password: string;
	userId: string;
};


describe("login function", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(login(mockDb));
	
	it("should return an error if username or password is missing", async() => {
		const response = await request(app)
			.post("/login")
			.send({username: "testuser"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return an error if username contains invalid characters", async() => {
		const response = await request(app).post("/login").send({
			username: "invalid$username",
			password: "password123",
		});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["username"]);
	});
	
	it("should return an error if user does not exist", async() => {
		mockDb.selectFrom.chain("User")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app).post("/login").send({
			username: "nonexistent",
			password: "password123",
		});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	it("should return an error if the password is incorrect", async() => {
		const mockUser: MockResult = {
			password: await encryptPassword("correctPassword"),
			userId: "1",
		};
		mockDb.selectFrom.chain("User")
			.executeTakeFirst.mockResolvedValue(mockUser);
		
		const response = await request(app).post("/login").send({
			username: "testuser",
			password: "wrongPassword",
		});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	it("should return the user id if login is successful", async() => {
		const mockUser: MockResult = {
			password: await encryptPassword("correctPassword"),
			userId: "1",
		};
		mockDb.selectFrom.chain("User")
			.where.chain("username", "=", "testuser")
			.executeTakeFirst.mockResolvedValue(mockUser);
		
		const response = await request(app).post("/login").send({
			username: "testuser",
			password: "correctPassword",
		});
		
		expect(response.ok).toBe(true);
		expect(response.body.data.userId).toBe(mockUser.userId);
	});
});