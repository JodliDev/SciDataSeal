import {afterAll, afterEach, describe, expect, it, vi} from "vitest";
import unpackResponse from "../../../src/frontend/actions/unpackResponse.ts";
import {ResponseFormat} from "../../../src/shared/ResponseFormat.ts";
import {Lang} from "../../../src/frontend/singleton/Lang.ts";

describe("unpackResponse", () => {
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	const mockJson = vi.fn();
	const mockResponse = (ok: boolean, data: any) => ({
		ok,
		json: mockJson.mockResolvedValue(data),
	});
	
	it("should return the data when response is ok and data.ok is true", async() => {
		const data = {ok: true, data: {id: 123, name: "Test"}} satisfies ResponseFormat<{}>;
		const response = mockResponse(true, data);
		
		const result = await unpackResponse(response as any);
		expect(result).toEqual(data.data);
	});
	
	it("should throw TranslatedException when response is ok but data.ok is false", async() => {
		const data = {ok: false, error: {message: "errorTest", values: ["param1", "param2"]}} satisfies ResponseFormat<{}>;
		const response = mockResponse(true, data);
		
		await expect(unpackResponse(response as any))
			.rejects.toMatchObject({message: "errorTest", values: ["param1", "param2"]});
	});
	
	it("should throw TranslatedException when response is not ok and error message exists", async() => {
		const data = {ok: false, error: {message: "errorTest", values: ["param1", "param2"]}} satisfies ResponseFormat<{}>;
		const response = mockResponse(false, data);
		
		await expect(unpackResponse(response as any))
			.rejects.toMatchObject({message: "errorTest", values: ["param1", "param2"]});
	});
	
	it("should throw TranslatedWithStatusException when response is not ok and error message is missing", async() => {
		const data = {};
		const response = mockResponse(false, data);
		
		await expect(unpackResponse(response as any))
			.rejects.toMatchObject({message: "errorNetwork", requestStatus: 500, values: []});
	});
	
	it("should try to translate error values", async() => {
		const mockGetDynamic = vi.spyOn(Lang, "getDynamic");
		vi.spyOn(Lang, "has").mockImplementation((key: string) => {
			return key == "param1";
		});
		const data = {ok: false, error: {message: "errorTest", values: ["param1", "param2"]}} satisfies ResponseFormat<{}>;
		const response = mockResponse(true, data);
		
		await expect(unpackResponse(response as any))
			.rejects.toMatchObject({message: "errorTest", values: ["param1", "param2"]});
		
		expect(mockGetDynamic).toHaveBeenCalledWith("param1");
		expect(mockGetDynamic).not.toHaveBeenCalledWith("param2");
	});
});