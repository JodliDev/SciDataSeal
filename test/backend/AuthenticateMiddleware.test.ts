import {afterAll, afterEach, beforeAll, describe, expect, it, Mock, vi} from "vitest";
import {NextFunction, Request, Response} from "express";
import isLoggedIn from "../../src/backend/actions/authentication/isLoggedIn.ts";
import AuthenticateMiddleware from "../../src/backend/AuthenticateMiddleware.ts";
import {DbType} from "../../src/backend/database/setupDb.ts";
import createErrorResponse from "../../src/backend/actions/createErrorResponse.ts";
import UnauthorizedException from "../../src/shared/exceptions/UnauthorizedException.ts";


describe("AuthenticateMiddleware", () => {
	beforeAll(() => {
		vi.mock("../../src/backend/actions/authentication/isLoggedIn.ts", () => ({
			default: vi.fn(),
		}));
		
		vi.mock("../../src/backend/actions/createErrorResponse.ts", () => ({
			default: vi.fn(),
		}));
	});
	afterEach(() => {
		vi.clearAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	const mockDb = {} as DbType;
	const mockRequest = {} as Request;
	const mockResponse = {
		status: vi.fn().mockReturnThis(),
		send: vi.fn(),
	} as unknown as Response;
	const nextFunction: NextFunction = vi.fn();
	
	const middleware = AuthenticateMiddleware(mockDb);
	
	
	it("should call next if user is logged in", async() => {
		(isLoggedIn as Mock).mockResolvedValue(true);
		
		await middleware(mockRequest, mockResponse, nextFunction);
		
		expect(isLoggedIn).toHaveBeenCalledWith(mockDb, mockRequest);
		expect(nextFunction).toHaveBeenCalled();
		expect(createErrorResponse).not.toHaveBeenCalled();
	});
	
	it('should create an error response if user is not logged in', async() => {
		(isLoggedIn as Mock).mockResolvedValue(false);
		
		await middleware(mockRequest, mockResponse, nextFunction);
		
		expect(isLoggedIn).toHaveBeenCalledWith(mockDb, mockRequest);
		expect(nextFunction).not.toHaveBeenCalled();
		expect(createErrorResponse).toHaveBeenCalledWith(new UnauthorizedException(), mockResponse);
	});
	
	it('should create an error response if isLoggedIn throws an error', async() => {
		const mockError = new Error('Database error');
		(isLoggedIn as Mock).mockRejectedValue(mockError);
		
		await middleware(mockRequest, mockResponse, nextFunction);
		
		expect(isLoggedIn).toHaveBeenCalledWith(mockDb, mockRequest);
		expect(nextFunction).not.toHaveBeenCalled();
		expect(createErrorResponse).toHaveBeenCalledWith(mockError, mockResponse);
	});
});