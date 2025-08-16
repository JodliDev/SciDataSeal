import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import {mockKysely} from "../../../convenience.ts";
import {AuthenticatedRequest} from "../../../../src/backend/AuthenticatedRequest.ts";
import isLoggedIn from "../../../../src/backend/actions/authentication/isLoggedIn.ts";
import authenticateRequest from "../../../../src/backend/actions/authentication/authenticateRequest.ts";

describe("isLoggedIn", () => {
	beforeAll(() => {
		vi.mock("../../../../src/backend/actions/authentication/authenticateRequest.ts", () => ({
			default: vi.fn(async(_, request) => {
				request.wasAuthenticated = true;
			})
		}));
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	const mockDb = mockKysely();
	
	it("should return true if request.isLoggedIn is already true and wasAuthenticated is true", async() => {
		const mockRequest = {
			wasAuthenticated: true,
			isLoggedIn: true
		} as AuthenticatedRequest;
		
		const result = await isLoggedIn(mockDb, mockRequest);
		expect(result).toBe(true);
		expect(authenticateRequest).not.toHaveBeenCalled();
	});
	
	it("should return false if request.isLoggedIn is false and wasAuthenticated is true", async() => {
		const mockRequest = {
			wasAuthenticated: true,
			isLoggedIn: false
		} as AuthenticatedRequest;
		
		const result = await isLoggedIn(mockDb, mockRequest);
		expect(result).toBe(false);
		expect(authenticateRequest).not.toHaveBeenCalled();
	});
	
	it("should call authenticateRequest() if wasAuthenticated is false", async() => {
		const mockRequest = {
			wasAuthenticated: false,
			isLoggedIn: true
		} as AuthenticatedRequest;
		
		const result = await isLoggedIn(mockDb, mockRequest);
		expect(result).toBe(true);
		expect(authenticateRequest).toHaveBeenCalledWith(mockDb, mockRequest);
	});
});