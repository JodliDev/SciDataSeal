import express from "express";
import request from "supertest";
import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import setQuestionnaire from "../../../src/backend/routes/setQuestionnaire.ts";
import getSessionData from "../../../src/backend/actions/authentication/getSessionData.ts";
import {mockKysely} from "../../MockKysely.ts";

describe("setQuestionnaire", () => {
	vi.mock("../../../src/backend/actions/authentication/getSessionData.ts", () => ({
		default: vi.fn().mockResolvedValue({isLoggedIn: true, userId: 123})
	}));
	
	afterEach(() => {
		mockDb.resetMocks()
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	const mockDb = mockKysely();
	const app = express();
	app.use(express.json());
	app.use("/", setQuestionnaire(mockDb));
	
	it("should return an error when required fields are missing", async() => {
		const response = await request(app).post("/setQuestionnaire").send({});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorMissingData");
	});
	
	it("should return an error when providing an invalid questionnaireName", async() => {
		const response = await request(app)
			.post("/setQuestionnaire")
			.send({
				questionnaireName: "testData$",
				studyId: 1,
				blockchainAccountId: 1,
				blockchainDenotation: 2,
				dataKey: "dataKey",
				apiPassword: "password"
			});
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["questionnaireName"]);
	});
	
	it("should return an error if blockchain account does not exist", async() => {
		const sendData = {
			questionnaireName: "test",
			studyId: 1,
			blockchainAccountId: 1,
			blockchainDenotation: 2,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		mockDb.selectFrom.chain("Study")
			.executeTakeFirst.mockResolvedValue({});
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["blockchainAccountId"]);
	});
	
	it("should return an error if study does not exist", async() => {
		const sendData = {
			questionnaireName: "test",
			studyId: 1,
			blockchainAccountId: 1,
			blockchainDenotation: 2,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		mockDb.selectFrom.chain("Study")
			.executeTakeFirst.mockResolvedValue(null);
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorFaultyData");
		expect(response.body.error).toHaveProperty("values", ["studyId"]);
	});
	
	it("should update an existing questionnaire when being logged in", async() => {
		const sendData = {
			id: 111,
			questionnaireName: "test",
			studyId: 1,
			blockchainAccountId: 1,
			blockchainDenotation: 2,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", 1)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({userId: 123});
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", sendData.blockchainAccountId)
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
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 111);
	});
	
	it("should create a new questionnaire when being logged in", async() => {
		const sendData = {
			questionnaireName: "newTest",
			studyId: 1,
			blockchainAccountId: 1,
			blockchainDenotation: 3,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", 1)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({userId: 123});
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", sendData.blockchainAccountId)
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
				studyId: 1,
				blockchainAccountId: sendData.blockchainAccountId,
				apiPassword: sendData.apiPassword,
				dataKey: sendData.dataKey,
				columns: "",
				blockchainDenotation: sendData.blockchainDenotation
			})
			.executeTakeFirst.mockResolvedValue({insertId: 42});
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateQuestionnaireTableMock).not.toHaveBeenCalled();
		expect(updateBlockchainTableMock).toHaveBeenCalled();
		expect(insertTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 42);
	});
	
	it("should return an error when blockchainDenotation already exists", async() => {
		const sendData = {
			questionnaireName: "test",
			studyId: 1,
			blockchainAccountId: 1,
			blockchainDenotation: 3,
			dataKey: "dataKey",
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", 1)
			.where.chain("userId", "=", 123)
			.executeTakeFirst.mockResolvedValue({userId: 123});
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.executeTakeFirst.mockResolvedValue({highestDenotation: sendData.blockchainDenotation + 1});
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(false);
		expect(response.body.error).toHaveProperty("message", "errorAlreadyExists");
		expect(response.body.error).toHaveProperty("values", ["blockchainDenotation"]);
	});
	
	it("should create a new questionnaire when not being logged in", async() => {
		vi.mocked(getSessionData).mockResolvedValue({isLoggedIn: false});
		
		const blockchainAccountId = 44;
		const highestDenotation = 55;
		const sendData = {
			questionnaireName: "newTest",
			studyId: 1,
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", sendData.studyId)
			.where.chain("apiPassword", "=", sendData.apiPassword)
			.executeTakeFirst.mockResolvedValue({userId: 123, blockchainAccountId: blockchainAccountId});
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", blockchainAccountId)
			.executeTakeFirst.mockResolvedValue({highestDenotation: highestDenotation});
		
		const updateQuestionnaireTableMock = mockDb.updateTable.chain("Questionnaire")
			.execute;
		
		const updateBlockchainTableMock = mockDb.updateTable.chain("BlockchainAccount")
			.set.chain({
				highestDenotation: highestDenotation + 1
			})
			.where.chain("blockchainAccountId", "=", blockchainAccountId)
			.execute;
		
		const insertTableMock = mockDb.insertInto.chain("Questionnaire")
			.values.chain({
				userId: 123,
				questionnaireName: sendData.questionnaireName,
				studyId: 1,
				blockchainAccountId: blockchainAccountId,
				apiPassword: sendData.apiPassword,
				dataKey: sendData.apiPassword,
				columns: "",
				blockchainDenotation: highestDenotation + 1
			})
			.executeTakeFirst.mockResolvedValue({insertId: 42});
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateQuestionnaireTableMock).not.toHaveBeenCalled();
		expect(updateBlockchainTableMock).toHaveBeenCalled();
		expect(insertTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 42);
	});
	
	it("should update an existing questionnaire when not being logged in", async() => {
		vi.mocked(getSessionData).mockResolvedValue({isLoggedIn: false});
		
		const blockchainAccountId = 44;
		const highestDenotation = 55;
		const sendData = {
			id: 111,
			questionnaireName: "test",
			studyId: 1,
			apiPassword: "password",
		};
		
		mockDb.selectFrom.chain("Study")
			.where.chain("studyId", "=", 1)
			.where.chain("apiPassword", "=", sendData.apiPassword)
			.executeTakeFirst.mockResolvedValue({userId: 123, blockchainAccountId: blockchainAccountId});
		
		mockDb.selectFrom.chain("BlockchainAccount")
			.where.chain("blockchainAccountId", "=", blockchainAccountId)
			.executeTakeFirst.mockResolvedValue({highestDenotation: highestDenotation});
		
		const updateTableMock = mockDb.updateTable.chain("Questionnaire")
			.set.chain({
				questionnaireName: sendData.questionnaireName,
				blockchainAccountId: blockchainAccountId,
				apiPassword: sendData.apiPassword,
				dataKey: sendData.apiPassword
			})
			.where.chain("questionnaireId", "=", 111)
			.execute;
		
		const response = await request(app)
			.post("/setQuestionnaire")
			.send(sendData);
		
		expect(response.ok).toBe(true);
		expect(updateTableMock).toHaveBeenCalled();
		expect(response.body.data).toHaveProperty("questionnaireId", 111);
	});
});