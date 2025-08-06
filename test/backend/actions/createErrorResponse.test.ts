import {describe, expect, it} from "vitest";
import createErrorResponse from "../../../src/backend/actions/createErrorResponse.ts";

// Mock Response object
class MockResponse {
	statusCode = 200;
	body: any = null;
	
	status(code: number) {
		this.statusCode = code;
		return this;
	}
	
	json(data: any) {
		this.body = data;
		return this;
	}
}

describe("createErrorResponse", () => {
	it("should set the correct status and format the error response for a known error", () => {
		const knownError = {
			requestStatus: 400,
			message: "Bad Request",
			values: ["invalid input"],
		};
		const mockResponse = new MockResponse();
		
		createErrorResponse(knownError, mockResponse as any);
		
		expect(mockResponse.statusCode).toBe(400);
		expect(mockResponse.body).toEqual({
			ok: false,
			error: {
				message: "Bad Request",
				values: ["invalid input"],
			},
		});
	});
	
	it("should set the status to 500 and use default values for an unknown error", () => {
		const unknownError = {};
		const mockResponse = new MockResponse();
		
		createErrorResponse(unknownError, mockResponse as any);
		
		expect(mockResponse.statusCode).toBe(500);
		expect(mockResponse.body).toEqual({
			ok: false,
			error: {
				message: "errorUnknown",
				values: [],
			},
		});
	});
	
	it("should use default values if knownError properties are missing", () => {
		const partialError = {
			message: "Partial Error",
		};
		const mockResponse = new MockResponse();
		
		createErrorResponse(partialError, mockResponse as any);
		
		expect(mockResponse.statusCode).toBe(500); // Default status
		expect(mockResponse.body).toEqual({
			ok: false,
			error: {
				message: "Partial Error",
				values: [],
			},
		});
	});
});