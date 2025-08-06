import {describe, expect, it} from "vitest";
import isValidBackendString from "../../../src/shared/actions/isValidBackendString.ts";

describe("isValidBackendString", () => {
	it("should return true for a valid string with letters, numbers, spaces, hyphens, and underscores", () => {
		expect(isValidBackendString("Valid_String-123")).toBe(true);
	});
	
	it("should return true for a string with only spaces", () => {
		expect(isValidBackendString("   ")).toBe(true);
	});
	
	it("should return false for an empty string", () => {
		expect(isValidBackendString("")).toBe(false);
	});
	
	it("should return false for a string with special characters", () => {
		expect(isValidBackendString("Invalid@String!")).toBe(false);
	});
	
	it("should return false for a string with symbols like # and $", () => {
		expect(isValidBackendString("Invalid#String$")).toBe(false);
	});
	
	it("should return true for a string with underscores and hyphens only", () => {
		expect(isValidBackendString("___---")).toBe(true);
	});
	
	it("should return true for a long valid string", () => {
		expect(isValidBackendString("This_is-a_valid_string123")).toBe(true);
	});
	
	it("should return true for a string with newline characters", () => {
		expect(isValidBackendString("Invalid\nString")).toBe(true);
	});
});