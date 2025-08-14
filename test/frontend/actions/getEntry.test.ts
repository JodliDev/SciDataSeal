import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import getData from "../../../src/frontend/actions/getData.ts";
import getEntry from "../../../src/frontend/actions/getEntry.ts";


describe("getEntry", () => {
	vi.mock("../../../src/frontend/actions/getData.ts");
	
	afterEach(() => {
		vi.resetAllMocks();
	});
	
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	it("should return data when getData resolves with valid data", async() => {
		const mockResponse = {someId: 111, someKey: "someValue"};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await getEntry("user", 111);
		expect(getData).toHaveBeenCalledWith("/getEntry", "?type=user&id=111");
		expect(result).toEqual(mockResponse);
	});
	
	it("should handle query parameters correctly", async() => {
		const mockResponse = {someId: 111, someKey: "someValue"};
		vi.mocked(getData).mockResolvedValue(mockResponse);
		
		const result = await getEntry("study", 111, "?param=value");
		expect(getData).toHaveBeenCalledWith(
			"/getEntry",
			"?param=value&type=study&id=111"
		);
		expect(result).toEqual(mockResponse);
	});
	
	it("should return undefined when getData resolves with no data", async() => {
		vi.mocked(getData).mockResolvedValue(undefined);
		
		const result = await getEntry("blockchainAccount", 111);
		expect(getData).toHaveBeenCalledWith("/getEntry", "?type=blockchainAccount&id=111");
		expect(result).toBeUndefined();
	});
});