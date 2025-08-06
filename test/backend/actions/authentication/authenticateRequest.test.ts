import {afterEach, describe, expect, it, vi} from "vitest";
import authenticateRequest from "../../../../src/backend/actions/authentication/authenticateRequest.ts";
import {mockKysely} from "../../../convenience.ts";

const mockDb = mockKysely();

const createMockRequest = (cookies: Record<string, string>, wasAuthenticated = false) => ({
	cookies,
	wasAuthenticated,
	isLoggedIn: false,
	userId: null,
	isAdmin: false,
} as any);

describe("authenticateRequest", () => {
	afterEach(() => {
		vi.clearAllMocks();
		mockDb.resetMocks();
	})
	
	it("should do nothing if the request was already authenticated", async() => {
		const request = createMockRequest({}, true);
		
		await authenticateRequest(mockDb, request);
		
		expect(mockDb.selectFrom).not.toHaveBeenCalled();
		expect(request.isLoggedIn).toBe(false);
		expect(request.userId).toBeNull();
		expect(request.isAdmin).toBe(false);
	});
	
	it("should do nothing if sessionToken or userId is missing", async() => {
		const request = createMockRequest({});
		
		await authenticateRequest(mockDb, request);
		
		expect(mockDb.selectFrom).not.toHaveBeenCalled();
		expect(request.isLoggedIn).toBe(false);
		expect(request.userId).toBeNull();
		expect(request.isAdmin).toBe(false);
	});
	
	it("should do nothing if sessionToken is invalid", async() => {
		const request = createMockRequest({sessionToken: "!invalid-token", userId: "1"});
		
		await authenticateRequest(mockDb, request);
		
		expect(mockDb.selectFrom).not.toHaveBeenCalled();
		expect(request.isLoggedIn).toBe(false);
		expect(request.userId).toBeNull();
		expect(request.isAdmin).toBe(false);
	});
	
	it("should authenticate valid session and set properties", async() => {
		const request = createMockRequest({sessionToken: "valid-token", userId: "1"});
		mockDb.executeTakeFirst.mockResolvedValueOnce({
			userId: 1,
			expires: Date.now() + 10000,
			isAdmin: true,
		});
		
		await authenticateRequest(mockDb, request);
		
		expect(mockDb.selectFrom).toHaveBeenCalledWith("Session");
		expect(request.isLoggedIn).toBe(true);
		expect(request.userId).toBe(1);
		expect(request.isAdmin).toBe(true);
		expect(request.wasAuthenticated).toBe(true);
	});
	
	it("should not authenticate if no session is found in the database", async() => {
		const request = createMockRequest({sessionToken: "valid-token", userId: "1"});
		mockDb.executeTakeFirst.mockResolvedValueOnce(null);
		
		await authenticateRequest(mockDb, request);
		
		expect(mockDb.selectFrom).toHaveBeenCalledWith("Session");
		expect(request.isLoggedIn).toBe(false);
		expect(request.userId).toBeNull();
		expect(request.isAdmin).toBe(false);
		expect(request.wasAuthenticated).toBeFalsy();
	});
});