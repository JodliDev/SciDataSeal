import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {compare, mockKysely} from "../../convenience.ts";
import syncBlockchain from "../../../src/backend/actions/syncBlockchain.ts";
import getBlockchain from "../../../src/backend/actions/getBlockchain.ts";
import {Logger} from "../../../src/backend/Logger.ts";


describe("syncBlockchain", () => {
	vi.mock("../../../src/backend/actions/getBlockchain.ts", () => ({
		default: vi.fn(() => ({
			saveMessage: vi.fn().mockResolvedValue(["signature1"]),
			isConfirmed: vi.fn().mockResolvedValue(true),
		}))
	}));
	
	const mockDb = mockKysely();
	
	afterEach(() => {
		mockDb.resetMocks();
	});
	afterAll(() => {
		vi.mocked(getBlockchain).mockRestore();
	});
	
	function mockSelectDataLogs(needsSending: any[], needsConfirmation: any[]) {
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", false)
			.execute
			.mockReturnValueOnce(needsSending);
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", true)
			.where.chain("wasConfirmed", "=", false)
			.execute
			.mockReturnValueOnce(needsConfirmation);
	}
	
	describe("send", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should process logs to send and update wasSent and wasConfirmed fields", async () => {
			mockSelectDataLogs([{
				logId: 1,
				privateKey: "privateKey1",
				blockchainDenotation: "89",
				data: "data1",
				isHeader: true,
				blockchainType: "type1",
			}], []);
			
			const updateTableMock = mockDb.updateTable.chain("DataLog").set;
			
			await syncBlockchain(mockDb);
			
			expect(updateTableMock).toHaveBeenCalledWith({
				data: "",
				wasSent: true,
				wasConfirmed: true,
				hasError: "",
				signatures: JSON.stringify(["signature1"]),
			});
		});
		
		it("should process logs with and without error separately", async () => {
			const saveMessageMock = vi.fn();
			const mock = vi.mocked(getBlockchain).mockReturnValue({
				saveMessage: saveMessageMock,
				isConfirmed: vi.fn(() => true),
			} as any);
			
			const defaultLog = {
				privateKey: "privateKey1",
				questionnaireId: 1,
				blockchainDenotation: 89,
				blockchainType: "type1",
				dataKey: "dataKey1",
				isHeader: false,
			}
			mockSelectDataLogs([
				{
					logId: 1,
					data: "data1",
					hasError: true,
					...defaultLog
				},
				{
					logId: 2,
					data: "data2",
					hasError: true,
					...defaultLog
				},
				{
					logId: 3,
					data: "data3",
					hasError: false,
					...defaultLog
				},
			], []);
			
			
			await syncBlockchain(mockDb);
			
			expect(saveMessageMock).toHaveBeenCalledWith("privateKey1", 89, ["data1", "data2"], false, "dataKey1");
			expect(saveMessageMock).toHaveBeenCalledWith("privateKey1", 89, ["data3"], false, "dataKey1");
			
			// cleanup:
			mock.mockRestore();
		});
		
		it("should process header and data logs separately and split via questionnaireId", async () => {
			const saveMessageMock = vi.fn();
			const mock = vi.mocked(getBlockchain).mockReturnValue({
				saveMessage: saveMessageMock,
				isConfirmed: vi.fn(() => true),
			} as any);
			
			const defaultLog = {
				privateKey: "privateKey1",
				blockchainDenotation: 89,
				blockchainType: "type1",
				dataKey: "dataKey1"
			}
			
			mockSelectDataLogs([
				{
					logId: 1,
					questionnaireId: 1,
					data: "data1",
					isHeader: true,
					...defaultLog
				},
				{
					logId: 2,
					questionnaireId: 1,
					data: "data2",
					isHeader: true,
					...defaultLog
				},
				{
					logId: 3,
					questionnaireId: 1,
					data: "data3",
					isHeader: false,
					...defaultLog
				},
				{
					logId: 4,
					questionnaireId: 1,
					data: "data4",
					isHeader: false,
					...defaultLog
				},
				{
					logId: 5,
					questionnaireId: 1,
					data: "data5",
					isHeader: false,
					...defaultLog
				},
				{
					logId: 6,
					questionnaireId: 2,
					data: "data6",
					isHeader: false,
					...defaultLog
				},
			], []);
			
			await syncBlockchain(mockDb);
			
			expect(saveMessageMock).toHaveBeenCalledWith("privateKey1", 89, ["data1", "data2"], true, "dataKey1");
			expect(saveMessageMock).toHaveBeenCalledWith("privateKey1", 89, ["data3", "data4", "data5"], false, "dataKey1");
			expect(saveMessageMock).toHaveBeenCalledWith("privateKey1", 89, ["data6"], false, "dataKey1");
			
			// cleanup:
			mock.mockRestore();
		});
		
		it("should save errors when sending logs", async() => {
			const loggerSpy = vi.spyOn(Logger, "error");
			
			mockSelectDataLogs([{
				logId: 1,
				privateKey: "privateKey1",
				blockchainDenotation: "89",
				data: "data1",
				isHeader: false,
				blockchainType: "type1",
			}], []);
			
			mockDb
				.updateTable.chain("DataLog")
				.set.chain(compare.objectContains({wasSent: true}))
				.execute.mockRejectedValueOnce(new Error("mock error"));
			
			const saveErrorMock = mockDb
				.updateTable.chain("DataLog")
				.set.chain({hasError: "mock error"})
				.where.chain("logId", "=", 1)
				.execute;
			
			
			await syncBlockchain(mockDb);
			
			expect(saveErrorMock).toHaveBeenCalled();
			
			// cleanup:
			loggerSpy.mockRestore();
		});
	});
	
	describe("confirm", () => {
		afterEach(() => {
			mockDb.resetMocks();
		});
		
		it("should confirm logs", async() => {
			mockSelectDataLogs([], [{
				logId: 1,
				blockchainType: "type1",
				signatures: JSON.stringify(["signature1", "signature2"]),
			}]);
			
			const updateTableMock = mockDb
				.updateTable.chain("DataLog")
				.execute;
			
			await syncBlockchain(mockDb);
			
			expect(updateTableMock).toHaveBeenCalled();
		});
		
		it("should confirm signatures only once", async() => {
			mockSelectDataLogs([], [
				{
					logId: 1,
					blockchainType: "type1",
					signatures: JSON.stringify(["signature1", "signature2"]),
				},
				{
					logId: 2,
					blockchainType: "type1",
					signatures: JSON.stringify(["signature1", "signature2"]),
				}
			]);
			
			const updateTableMock1 = mockDb
				.updateTable.chain("DataLog")
				.where.chain("logId", "=", 1)
				.execute;
			
			const updateTableMock2 = mockDb
				.updateTable.chain("DataLog")
				.where.chain("logId", "=", 2)
				.execute;
			
			await syncBlockchain(mockDb);
			
			expect(updateTableMock1).toHaveBeenCalled();
			expect(updateTableMock2).not.toHaveBeenCalled();
		});
		
		it("should handle errors while confirming logs", async() => {
			const dataLogsForConfirmation = {
				blockchainType: "type1",
				signatures: JSON.stringify(["signature1"]),
			};
			mockSelectDataLogs([], [{...dataLogsForConfirmation, logId: 1}, {...dataLogsForConfirmation, logId: 2}]);
			
			const updateTableMock1 = mockDb
				.updateTable.chain("DataLog")
				.where.chain("logId", "=", 1)
				.execute.mockRejectedValueOnce(new Error("mock error"));
			
			const updateTableMock2 = mockDb
				.updateTable.chain("DataLog")
				.where.chain("logId", "=", 2)
				.execute;
			
			await syncBlockchain(mockDb);
			
			expect(updateTableMock1).toHaveBeenCalled();
			expect(updateTableMock2).toHaveBeenCalled();
		});
	});
});