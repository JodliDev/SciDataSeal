import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import request from "supertest";
import express from "express";
import {mockKysely} from "../../convenience.ts";
import setUser from "../../../src/backend/routes/setUser.ts";

describe("setUser", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
	}));
	
	afterEach(() => {
		dbMock.resetMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	const dbMock = mockKysely();
	const app = express();
	app.use(express.json());
	app.use(setUser(dbMock));
	
	it("should throw error if username is missing", async() => {
		const response = await request(app)
			.post("/setUser")
			.send({password: "securePassword"});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should throw error if username already exists", async() => {
		const sendData = {id: 1, username: "existingUser", password: "securePassword"};
		
		dbMock.selectFrom.chain()
			.where.chain("username", "=", sendData.username)
			.executeTakeFirst.mockResolvedValueOnce({userId: 2});
		
		const response = await request(app)
			.post("/setUser")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUsernameAlreadyExists");
	});
	
	it("should throw error if trying to change own user", async() => {
		const sendData = {
			id: 123,
			username: "newUsername",
			isAdmin: false,
			password: "securePassword",
		};
		
		dbMock.selectFrom.chain("User")
			.where.chain("username", "=", sendData.username)
			.executeTakeFirst.mockResolvedValueOnce({userId: 123});
		
		const response = await request(app)
			.post("/setUser")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorCannotChangeOwnUser");
	});
	
	it("should create a new user if id is not provided", async() => {
		const sendData = {
			username: "newUser",
			password: "securePassword",
			isAdmin: false,
		};
		
		const updateMock = dbMock.updateTable.chain("User")
			.executeTakeFirst;
		
		const insertMock = dbMock.insertInto.chain("User")
			.executeTakeFirst.mockResolvedValue({insertId: 123});
		
		const response = await request(app)
			.post("/setUser")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateMock).not.toHaveBeenCalled();
		expect(insertMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("userId", 123);
	});
	
	it("should NOT create a new user if password is missing", async() => {
		const sendData = {
			username: "newUser",
			isAdmin: false,
		};
		
		const updateMock = dbMock.updateTable.chain("User")
			.executeTakeFirst;
		
		const insertMock = dbMock.insertInto.chain("User")
			.executeTakeFirst.mockResolvedValue({insertId: 123});
		
		const response = await request(app)
			.post("/setUser")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(updateMock).not.toHaveBeenCalled();
		expect(insertMock).not.toHaveBeenCalled();
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should update existing user", async() => {
		const sendData = {
			id: 2,
			username: "updatedUser",
			isAdmin: true,
			password: "updatedPassword",
		};
		
		const insertMock = dbMock.insertInto.chain("User")
			.executeTakeFirst;
		
		const updateMock = dbMock.updateTable.chain("User")
			.where.chain("userId", "=", sendData.id)
			.executeTakeFirst;
		
		const response = await request(app)
			.post("/setUser")
			.send({
				id: 2,
				username: "updatedUser",
				isAdmin: true,
				password: "updatedPassword",
			});
		
		
		expect(response.ok).toBe(true);
		expect(insertMock).not.toHaveBeenCalled();
		expect(updateMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("userId", 2);
	});
	
	it("should update existing user if password is missing", async() => {
		const sendData = {
			id: 2,
			username: "updatedUser",
			isAdmin: true,
		};
		
		const insertMock = dbMock.insertInto.chain("User")
			.set({
				username: sendData.username,
				isAdmin: sendData.isAdmin,
			})
			.executeTakeFirst;
		
		const updateMock = dbMock.updateTable.chain("User")
			.where.chain("userId", "=", sendData.id)
			.executeTakeFirst;
		
		const response = await request(app)
			.post("/setUser")
			.send({
				id: 2,
				username: "updatedUser",
				isAdmin: true,
				password: "updatedPassword",
			});
		
		
		expect(response.ok).toBe(true);
		expect(insertMock).not.toHaveBeenCalled();
		expect(updateMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("userId", 2);
	});
});