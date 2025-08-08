import {describe, expect, it} from "vitest";
import generateHash from "../../../src/frontend/actions/generateHash.ts";

describe("generateHash", () => {
	it("should return a consistent hash for the same input", () => {
		const input = "test";
		const hash1 = generateHash(input);
		const hash2 = generateHash(input);
		expect(hash1).toBe(hash2);
	});
	
	it("should return different hashes for different inputs", () => {
		const input1 = "test";
		const input2 = "anotherTest";
		const hash1 = generateHash(input1);
		const hash2 = generateHash(input2);
		expect(hash1).not.toBe(hash2);
	});
	
	it("should handle empty strings correctly", () => {
		const input = "";
		const hash = generateHash(input);
		expect(hash).toBe(0);
	});
	
	it("should handle special character strings", () => {
		const input = "!@#$%^&*()";
		const hash = generateHash(input);
		expect(hash).not.toBe(0);
	});
	
	it("should handle long strings consistently", () => {
		const input = "a".repeat(1000);
		const hash1 = generateHash(input);
		const hash2 = generateHash(input);
		expect(hash1).toBe(hash2);
	});
});