import {afterEach, describe, expect, test} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import getUser from "../../../src/backend/routes/getUser.ts";

describe("getUser function", () => {
	afterEach(() => {
		mockDb.resetMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", getUser(mockDb));
	
	const mockUser = {
		userId: 1,
		username: "testUser",
		isAdmin: false,
	};
	
	test("should return user data for valid userId", async() => {
		const queryData = {userId: "1"};
		
		mockDb.selectFrom.chain("User")
			.where.chain("userId", "=", parseInt(queryData.userId))
			.executeTakeFirst.mockResolvedValueOnce(mockUser);
		
		const response = await request(app)
			.get("/getUser")
			.query(queryData)
			.send(queryData);
		
		expect(response.ok).toBe(true);
		expect(response.body.data).toEqual(mockUser);
	});
	
	test("should return error when no userId is provided", async() => {
		const response = await request(app)
			.get("/getUser")
			.send({});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	test("should return error when user is not found", async() => {
		const queryData = {userId: "1"};
		mockDb.selectFrom.chain("User")
			.where.chain("userId", "=", parseInt(queryData.userId))
			.executeTakeFirst.mockResolvedValueOnce(null);
		
		const response = await request(app)
			.get("/getUser")
			.query(queryData)
			.send({userId: "1"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorNotFound");
	});
});