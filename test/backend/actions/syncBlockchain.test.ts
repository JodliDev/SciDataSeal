import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../convenience.ts";
import syncBlockchain from "../../../src/backend/actions/syncBlockchain.ts";
import getBlockchain from "../../../src/backend/actions/getBlockchain.ts";


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
	})
	
	it("should process logs to send and update wasSent and wasConfirmed fields", async () => {
		const dataLogsToSend = [
			{
				logId: 1,
				privateKey: "privateKey1",
				blockchainDenotation: "89",
				data: "data1",
				isHeader: true,
				blockchainType: "type1",
			}
		];
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", false)
			.execute
			.mockReturnValueOnce(dataLogsToSend);
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", true)
			.where.chain("wasConfirmed", "=", false)
			.execute
			.mockReturnValueOnce([]);
		
		const updateTableMock = mockDb.updateTable.chain("DataLog").set;
		
		await syncBlockchain(mockDb);
		
		expect(updateTableMock).toHaveBeenCalledWith({
			data: "",
			wasSent: true,
			wasConfirmed: true,
			signatures: JSON.stringify(["signature1"]),
		});
		
		// cleanup:
		vi.mocked(getBlockchain).mockRestore();
	});
	
	it("should handle errors while sending logs", async() => {
		const dataLogsToSend = {
			privateKey: "privateKey1",
			blockchainDenotation: "89",
			data: "data1",
			isHeader: true,
			blockchainType: "type1",
		};
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", false)
			.execute
			.mockReturnValueOnce([{...dataLogsToSend, logId: 1}, {...dataLogsToSend, logId: 2}]);
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", true)
			.where.chain("wasConfirmed", "=", false)
			.execute
			.mockReturnValueOnce([]);
		
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

	it("should confirm logs that were sent but not confirmed", async() => {
		const dataLogsForConfirmation = [
			{logId: 2, blockchainType: "type1"},
		];
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", false)
			.execute
			.mockReturnValueOnce([]);
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", true)
			.where.chain("wasConfirmed", "=", false)
			.execute
			.mockReturnValueOnce(dataLogsForConfirmation);
		
		const updateTableMock = mockDb
			.updateTable.chain("DataLog")
			.set.chain({
				wasConfirmed: true
			})
			.execute;
		
		await syncBlockchain(mockDb);

		expect(updateTableMock).toHaveBeenCalled();
	});

	it("should handle errors while confirming logs", async() => {
		const dataLogsForConfirmation = {logId: 2, blockchainType: "type1"};
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", false)
			.execute
			.mockReturnValueOnce([]);
		
		mockDb.selectFrom.chain("DataLog")
			.where.chain("wasSent", "=", true)
			.where.chain("wasConfirmed", "=", false)
			.execute
			.mockReturnValueOnce([{...dataLogsForConfirmation, logId: 1}, {...dataLogsForConfirmation, logId: 2}]);
		
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