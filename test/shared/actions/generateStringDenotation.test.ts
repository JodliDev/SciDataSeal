import {describe, expect, it} from "vitest";
import generateStringDenotation from "../../../src/shared/actions/generateStringDenotation.ts";


describe("generateStringDenotation", () => {
	it("should generate denotation with a padded character if input is between 0 and 61", () => {
		const result = generateStringDenotation(10);
		expect(result).toBe(" a");
	});
	
	it("should generate denotation with two characters if input is between 62 and 3843", () => {
		const result = generateStringDenotation(62);
		expect(result).toBe("10");
	});
	
	it("should throw an error if denotation length exceeds 2", () => {
		expect(() => generateStringDenotation(3844)).toThrow("errorDenotationIsTooLarge");
	});
});