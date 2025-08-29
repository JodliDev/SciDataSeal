import {describe, expect, it} from "vitest";
import createCsvLine from "../../../src/backend/actions/createCsvLine.ts";
import {SEPARATOR} from "../../../src/shared/definitions/Constants.ts";

describe("createCsvLine", () => {
	it("should handle newlines and carriage returns within the items", () => {
		const input = ["apple\npie", "banana\r", "che\r\nrry"];
		const result = createCsvLine(input);
		expect(result).toBe(`"apple pie"${SEPARATOR}"banana "${SEPARATOR}"che  rry"`);
	});
	
	it("should wrap items in double quotes and join them with commas", () => {
		const input = ["apple", "banana", "cherry"];
		const result = createCsvLine(input);
		expect(result).toBe(`"apple"${SEPARATOR}"banana"${SEPARATOR}"cherry"`);
	});
	
	it("should replace all double quotes with single quotes and handle complex input", () => {
		const input = ['"apple"', '"ba"na"na"', 'cher"ry'];
		const result = createCsvLine(input);
		expect(result).toBe(`"'apple'"${SEPARATOR}"'ba'na'na'"${SEPARATOR}"cher'ry"`);
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
		expect(result).toBe(`""${SEPARATOR}"apple"${SEPARATOR}""`);
	});
});