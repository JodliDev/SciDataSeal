import {describe, expect, it} from "vitest";
import createCsvLine from "../../../src/backend/actions/createCsvLine.ts";

describe("createCsvLine", () => {
	it("should wrap items in double quotes and join them with commas", () => {
		const input = ["apple", "banana", "cherry"];
		const result = createCsvLine(input);
		expect(result).toBe('"apple","banana","cherry"');
	});
	
	it("should replace all double quotes with single quotes in the items", () => {
		const input = ['"apple"', '"ba"na"na"', 'cher"ry'];
		const result = createCsvLine(input);
		expect(result).toBe("\"'apple'\",\"'ba'na'na'\",\"cher'ry\"");
	});
	
	it("should work with an empty array", () => {
		const input: string[] = [];
		const result = createCsvLine(input);
		expect(result).toBe('""');
	});
	
	it("should handle single item arrays", () => {
		const input = ["single"];
		const result = createCsvLine(input);
		expect(result).toBe('"single"');
	});
	
	it("should handle items that are empty strings", () => {
		const input = ["", "apple", ""];
		const result = createCsvLine(input);
		expect(result).toBe('"","apple",""');
	});
});