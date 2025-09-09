import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import isAdmin from "../../../../src/backend/actions/authentication/isAdmin.ts";
import authenticateRequest from "../../../../src/backend/actions/authentication/authenticateRequest.ts";
import {AuthenticatedRequest} from "../../../../src/backend/AuthenticatedRequest.ts";
import {mockKysely} from "../../../MockKysely.ts";

vi.mock("../../../../src/backend/actions/authentication/authenticateRequest.ts", () => ({
	default: vi.fn(async(_, request) => {
		request.wasAuthenticated = true;
	})
}));


describe("isAdmin", () => {
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
	
	it("should return true if request.isAdmin is already true and wasAuthenticated is true", async() => {
		const mockRequest = {
			wasAuthenticated: true,
			isAdmin: true
		} as AuthenticatedRequest;
		
		const result = await isAdmin(mockDb, mockRequest);
		expect(result).toBe(true);
		expect(authenticateRequest).not.toHaveBeenCalled();
	});
	
	it("should return false if request.isAdmin is false and wasAuthenticated is true", async() => {
		const mockRequest = {
			wasAuthenticated: true,
			isAdmin: false
		} as AuthenticatedRequest;
		
		const result = await isAdmin(mockDb, mockRequest);
		expect(result).toBe(false);
		expect(authenticateRequest).not.toHaveBeenCalled();
	});
	
	it("should call authenticateRequest if wasAuthenticated is false", async() => {
		const mockRequest = {
			wasAuthenticated: false,
			isAdmin: true
		} as AuthenticatedRequest;
		
		const result = await isAdmin(mockDb, mockRequest);
		expect(result).toBe(true);
		expect(authenticateRequest).toHaveBeenCalledWith(mockDb, mockRequest);
	});
});