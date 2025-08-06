import {describe, expect, it} from "vitest";
import {Request} from "express";
import getAuthHeader from "../../../../src/backend/actions/authentication/getAuthHeader.ts";

describe("getAuthHeader", () => {
	it("should return the token when Authorization header is in the correct format", () => {
		const mockRequest = {
			headers: {
				authorization: "Bearer my-token",
			},
		} as Request;
		const result = getAuthHeader(mockRequest);
		expect(result).toBe("my-token");
	});
	
	it("should return an empty string if Authorization header is 'Bearer ' (no token)", () => {
		const mockRequest = {
			headers: {
				authorization: "Bearer ",
			},
		} as Request;
		const result = getAuthHeader(mockRequest);
		expect(result).toBe("");
	});
	
	it("should return null if Authorization header is missing", () => {
		const mockRequest = {
			headers: {},
		} as Request;
		const result = getAuthHeader(mockRequest);
		expect(result).toBeNull();
	});
});