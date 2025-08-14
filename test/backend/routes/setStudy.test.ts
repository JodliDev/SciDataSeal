import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import setStudy from "../../../src/backend/routes/setStudy.ts";

describe("setStudy", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({isLoggedIn: true, userId: 123})
	}));
	
	afterEach(() => {
		mockDb.resetMocks()
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", setStudy(mockDb));
	
	it("should return an error when required fields are missing", async() => {
		const response = await request(app).post("/setStudy").send({});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return an error when providing an invalid studyName", async() => {
		const response = await request(app)
			.post("/setStudy")
			.send({
				studyName: "testData$",
				blockchainAccountId: 1,
				apiPassword: "password"
			});
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["studyName"]);
	});
	
	it("should update an existing study", async() => {
		const sendData = {
			id: 111,
			studyName: "testData",
			blockchainAccountId: 1,
			apiPassword: "password"
		};
		
		const updateTableMock = mockDb.updateTable.chain("Study")
			.set.chain({
				studyName: sendData.studyName,
				apiPassword: sendData.apiPassword,
				blockchainAccountId: sendData.blockchainAccountId
			})
			.where.chain("studyId", "=", sendData.id)
			.execute;
		
		const response = await request(app)
			.post("/setStudy")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("studyId", sendData.id);
	});
	
	it("should create a new study", async() => {
		const sendData = {
			studyName: "testData",
			blockchainAccountId: 1,
			apiPassword: "password"
		};
		
		const insertTableMock = mockDb.insertInto.chain("Study")
			.values.chain({
				userId: 123,
				studyName: sendData.studyName,
				apiPassword: sendData.apiPassword,
				blockchainAccountId: sendData.blockchainAccountId
			})
			.executeTakeFirst.mockResolvedValue({insertId: 42});
		
		const response = await request(app)
			.post("/setStudy")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(insertTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("studyId", 42);
	});
});