import {describe, expect, it, vi} from "vitest";
import {AuthenticatedRequest} from "../../../../src/backend/AuthenticatedRequest.ts";
import getSessionData, {getLoggedInSessionData} from "../../../../src/backend/actions/authentication/getSessionData.ts";
import authenticateRequest from "../../../../src/backend/actions/authentication/authenticateRequest.ts";
import UnauthorizedException from "../../../../src/shared/exceptions/UnauthorizedException.ts";
import {mockKysely} from "../../../MockKysely.ts";

describe("getSessionData", () => {
	const mockDb = mockKysely();
	
	it("should return session data when the request is already authenticated", async() => {
		const mockRequest: AuthenticatedRequest = {
			wasAuthenticated: true,
			isLoggedIn: true,
			userId: 123,
			isAdmin: false,
		} as AuthenticatedRequest;
		
		const result = await getSessionData(mockDb, mockRequest);
		
		expect(result).toEqual({
			wasAuthenticated: true,
			isLoggedIn: true,
			userId: 123,
			isAdmin: false,
		});
	});
	
	it("should authenticate the request and return session data when not authenticated", async() => {
		const mockRequest = {
			wasAuthenticated: false,
			isLoggedIn: true,
			userId: 456,
			isAdmin: true,
		} as AuthenticatedRequest;
		
		vi.mock("../../../../src/backend/actions/authentication/authenticateRequest.ts", () => ({
			default: vi.fn(async(_, request) => {
				request.wasAuthenticated = true;
			})
		}));
		
		const result = await getSessionData(mockDb, mockRequest);
		
		expect(authenticateRequest).toHaveBeenCalledOnce();
		expect(result).toEqual({
			wasAuthenticated: true,
			isLoggedIn: true,
			userId: 456,
			isAdmin: true,
		});
		
		vi.mocked(authenticateRequest).mockRestore();
	});
});

describe("getLoggedInSessionData", () => {
	const mockDb = mockKysely();
	
	it("should return complete session data when request is authenticated and valid", async() => {
		const mockRequest: AuthenticatedRequest = {
			wasAuthenticated: true,
			isLoggedIn: true,
			userId: 12345,
			isAdmin: false,
		} as AuthenticatedRequest;
		
		const result = await getLoggedInSessionData(mockDb, mockRequest);
		
		expect(result).toEqual({
			wasAuthenticated: true,
			isLoggedIn: true,
			userId: 12345,
			isAdmin: false,
		});
	});
	
	it("should throw UnauthorizedException when request was not authenticated", async() => {
		const mockRequest: AuthenticatedRequest = {
			wasAuthenticated: false,
			isLoggedIn: false,
			userId: 12345,
			isAdmin: false,
		} as AuthenticatedRequest;
		
		await expect(getLoggedInSessionData(mockDb, mockRequest)).rejects.toThrow(
			UnauthorizedException
		);
	});
	
	it("should throw UnauthorizedException when user is not logged in", async() => {
		const mockRequest: AuthenticatedRequest = {
			wasAuthenticated: true,
			isLoggedIn: false,
			userId: 12345,
			isAdmin: false,
		} as AuthenticatedRequest;
		
		await expect(getLoggedInSessionData(mockDb, mockRequest)).rejects.toThrow(
			UnauthorizedException
		);
	});
	
	it("should throw UnauthorizedException when no userID was provided", async() => {
		const mockRequest = {
			wasAuthenticated: true,
			isLoggedIn: false,
			userId: undefined,
			isAdmin: false,
		} as AuthenticatedRequest;
		
		await expect(getLoggedInSessionData(mockDb, mockRequest)).rejects.toThrow(
			UnauthorizedException
		);
	});
});