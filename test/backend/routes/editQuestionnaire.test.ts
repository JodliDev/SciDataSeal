import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import editQuestionnaire from "../../../src/backend/routes/editQuestionnaire.ts";
import {mockKysely} from "../../convenience.ts";

describe("editQuestionnaire", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		getLoggedInSessionData: vi.fn().mockResolvedValue({userId: 123})
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
	app.use("/", editQuestionnaire(mockDb));
	
	it("should return an error when required fields are missing", async() => {
		const response = await request(app).post("/editQuestionnaire").send({});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return an error when providing an invalid questionnaireName", async() => {
		const response = await request(app)
			.post("/editQuestionnaire")
			.send({
				questionnaireName: "testData$",
				blockchainAccountId: 1,
				blockchainDenotation: 2,
				dataKey: "dataKey",
				apiPassword: "password",
			});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["questionnaireName"]);
	});
	
	it("should return an error if blockchain account does not exist", async() => {
		const sendData = {
			questionnaireName: "test",
			blockchainAccountId: 1,
			blockchainDenotation: 2,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/editQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorUnauthorized");
	});
	
	it("should update an existing questionnaire", async() => {
		const sendData = {
			id: 111,
			questionnaireName: "test",
			blockchainAccountId: 1,
			blockchainDenotation: 2,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", sendData.blockchainAccountId)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({highestDenotation: 1});
		
		const updateTableMock = mockDb.updateTable.chain("Questionnaire")
			.set.chain({
				questionnaireName: sendData.questionnaireName,
				blockchainAccountId: sendData.blockchainAccountId,
				apiPassword: sendData.apiPassword,
				dataKey: sendData.dataKey,
				blockchainDenotation: sendData.blockchainDenotation
			})
			.where.chain("questionnaireId", "=", 111)
			.execute;
		
		const response = await request(app)
			.post("/editQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 111);
	});
	
	it("should create a new questionnaire", async() => {
		const sendData = {
			questionnaireName: "newTest",
			blockchainAccountId: 1,
			blockchainDenotation: 3,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", sendData.blockchainAccountId)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({highestDenotation: 1});
		
		const updateQuestionnaireTableMock = mockDb.updateTable.chain("Questionnaire")
			.execute;
		
		const updateBlockchainTableMock = mockDb.updateTable.chain("BlockchainAccount")
			.set.chain({
				highestDenotation: sendData.blockchainDenotation
			})
			.where.chain("blockchainAccountId", "=", sendData.blockchainAccountId)
			.execute;
		
		const insertTableMock = mockDb.insertInto.chain("Questionnaire")
			.values.chain({
				userId: 123,
				questionnaireName: sendData.questionnaireName,
				blockchainAccountId: sendData.blockchainAccountId,
				apiPassword: sendData.apiPassword,
				dataKey: sendData.dataKey,
				columns: "",
				blockchainDenotation: sendData.blockchainDenotation
			})
			.executeTakeFirst.mockResolvedValue({insertId: 42});
		
		const response = await request(app)
			.post("/editQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateQuestionnaireTableMock).not.toHaveBeenCalled();
		expect(updateBlockchainTableMock).toHaveBeenCalled();
		expect(insertTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 42);
	});
	
	it("should return an error if blockchainDenotation already exists", async() => {
		const sendData = {
			questionnaireName: "test",
			blockchainAccountId: 1,
			blockchainDenotation: 3,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue({highestDenotation: sendData.blockchainDenotation + 1});
		
		const response = await request(app)
			.post("/editQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorAlreadyExists");
		expect(response.body.error).toHaveProperty("values", ["blockchainDenotation"]);
	});
});