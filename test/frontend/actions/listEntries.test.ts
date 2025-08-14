import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import listEntries from "../../../src/frontend/actions/listEntries.ts";
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
		expect(getData).toHaveBeenCalledWith("/listEntries", "?type=users");
		expect(result).toEqual(mockResponse.list);
	});
	
	it("should handle query parameters correctly", async() => {
		const mockResponse = {list: [{id: 2, name: "Item 2"}]};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await listEntries("studies", "?param=value");
		expect(getData).toHaveBeenCalledWith(
			"/listEntries",
			"?param=value&type=studies"
		);
		expect(result).toEqual(mockResponse.list);
	});
	
	it("should return undefined when getData resolves with no data", async() => {
		vi.mocked(getData).mockResolvedValue(undefined);
		
		const result = await listEntries("blockchainAccounts");
		expect(getData).toHaveBeenCalledWith("/listEntries", "?type=blockchainAccounts");
		expect(result).toBeUndefined();
	});
});