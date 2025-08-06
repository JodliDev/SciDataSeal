import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from "vitest";
import {Request, Response} from "express";
import {Kysely} from "kysely";
import AdminMiddleware from "../../src/backend/AdminMiddleware.ts";
import isLoggedIn from "../../src/backend/actions/authentication/isLoggedIn.ts";
import isAdmin from "../../src/backend/actions/authentication/isAdmin.ts";
import createErrorResponse from "../../src/backend/actions/createErrorResponse.ts";
import UnauthorizedException from "../../src/shared/exceptions/UnauthorizedException.ts";


describe("AdminMiddleware", () => {
	beforeAll(() => {
		vi.mock("../../src/backend/actions/authentication/isLoggedIn.ts", () => ({
			default: vi.fn(),
		}));
		vi.mock("../../src/backend/actions/authentication/isAdmin.ts", () => ({
			default: vi.fn(),
		}));
		vi.mock("../../src/backend/actions/createErrorResponse.ts", () => ({
			default: vi.fn(),
		}));
	});
	afterEach(() => {
		vi.clearAllMocks();
	})
	afterAll(() => {
		vi.resetAllMocks();
	});
	const mockDb = {} as Kysely<any>;
	const mockRequest = {} as Request;
	const mockResponse = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	} as unknown as Response;
	const mockNext = vi.fn();
	
	const middleware = AdminMiddleware(mockDb);
	
	
	it("should call next if the user is logged in and is an admin", async() => {
		vi.mocked(isLoggedIn).mockResolvedValue(true);
		vi.mocked(isAdmin).mockResolvedValue(true);
		
		await middleware(mockRequest, mockResponse, mockNext);
		
		expect(mockNext).toHaveBeenCalled();
		expect(createErrorResponse).not.toHaveBeenCalled();
	});
	
	it("should create an error response if the user is not logged in", async() => {
		vi.mocked(isLoggedIn).mockResolvedValue(false);
		vi.mocked(isAdmin).mockResolvedValue(false);
		
		await middleware(mockRequest, mockResponse, mockNext);
		
		expect(createErrorResponse).toHaveBeenCalledWith(expect.any(UnauthorizedException), mockResponse);
		expect(mockNext).not.toHaveBeenCalled();
	});
	
	it("should create an error response if the user is not an admin", async() => {
		vi.mocked(isLoggedIn).mockResolvedValue(true);
		vi.mocked(isAdmin).mockResolvedValue(false);
		
		await middleware(mockRequest, mockResponse, mockNext);
		
		expect(createErrorResponse).toHaveBeenCalledWith(expect.any(UnauthorizedException), mockResponse);
		expect(mockNext).not.toHaveBeenCalled();
	});
	
	it("should create an error response if an error is thrown", async() => {
		const mockError = new Error("Unexpected Error");
		vi.mocked(isLoggedIn).mockRejectedValue(mockError);
		
		await middleware(mockRequest, mockResponse, mockNext);
		
		expect(createErrorResponse).toHaveBeenCalledWith(mockError, mockResponse);
		expect(mockNext).not.toHaveBeenCalled();
	});
});