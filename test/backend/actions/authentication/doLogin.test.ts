import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import {Response} from "express";
import doLogin from "../../../../src/backend/actions/authentication/doLogin.ts";
import {mockKysely} from "../../../convenience.ts";
import {SESSION_MAX_AGE} from "../../../../src/shared/definitions/Constants.ts";
import createNewSession from "../../../../src/backend/actions/authentication/createNewSession.ts";
import {Cookies} from "../../../../src/shared/definitions/Cookies.ts";

describe("doLogin", () => {
	beforeAll(() => {
		vi.mock("../../../../src/backend/actions/authentication/createNewSession.ts", () => ({
			default: vi.fn().mockResolvedValue("mockSessionToken"),
		}));
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	const mockDb = mockKysely();
	
	it("should create a new session and set cookies in the response", async() => {
		const mockResponse = {
			cookie: vi.fn(),
		} as unknown as Response;
		
		const mockUserId = 123;
		const mockToken = "mockSessionToken";
		
		
		await doLogin(mockDb, mockResponse, mockUserId);
		
		expect(createNewSession).toHaveBeenCalledOnce();
		expect(createNewSession).toHaveBeenCalledWith(mockDb, mockUserId);
		
		expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
		expect(mockResponse.cookie).toHaveBeenCalledWith(Cookies.sessionToken, mockToken, {
			secure: true,
			httpOnly: true,
			maxAge: SESSION_MAX_AGE,
		});
		expect(mockResponse.cookie).toHaveBeenCalledWith(Cookies.userId, mockUserId, {
			secure: true,
			httpOnly: true,
			maxAge: SESSION_MAX_AGE,
		});
	});
});