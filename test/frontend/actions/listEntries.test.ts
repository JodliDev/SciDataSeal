import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import listEntries, {listEntriesWithPages} from "../../../src/frontend/actions/listEntries.ts";
import getData from "../../../src/frontend/actions/getData.ts";


describe("listEntries", () => {
	vi.mock("../../../src/frontend/actions/getData.ts");
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should return the list when getData resolves with valid data", async() => {
		const mockResponse = {list: [{id: 1, name: "Item 1"}]};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await listEntries("users");
		expect(getData).toHaveBeenCalledWith("/listEntries", "?type=users&page=0");
		expect(result).toEqual(mockResponse.list);
	});
	
	it("should handle query parameters correctly", async() => {
		const mockResponse = {list: [{id: 2, name: "Item 2"}]};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await listEntries("studies", "?param=value");
		expect(getData).toHaveBeenCalledWith(
			"/listEntries",
			"?param=value&type=studies&page=0"
		);
		expect(result).toEqual(mockResponse.list);
	});
	
	it("should return undefined when getData resolves with no data", async() => {
		vi.mocked(getData).mockResolvedValue(undefined);
		
		const result = await listEntries("blockchainAccounts");
		expect(getData).toHaveBeenCalledWith("/listEntries", "?type=blockchainAccounts&page=0");
		expect(result).toBeUndefined();
	});
});

describe("listEntriesWithPages", () => {
	vi.mock("../../../src/frontend/actions/getData.ts");
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should fetch data correctly for a valid type and default page", async() => {
		const mockResponse = {list: [{id: 1, label: "Test"}], totalCount: 1};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await listEntriesWithPages("users");
		expect(result).toEqual(mockResponse);
	});
	
	it("should respect the page parameter", async() => {
		const page = 2;
		const mockResponse = {list: [{id: 2, label: "Test Page 2"}], totalCount: 5};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await listEntriesWithPages("users", page);
		expect(result).toEqual(mockResponse);
	});
	
	it("should return undefined if no data is fetched", async() => {
		vi.mocked(getData).mockResolvedValue(undefined);
		
		const result = await listEntriesWithPages("users");
		expect(result).toBeUndefined();
	});
});