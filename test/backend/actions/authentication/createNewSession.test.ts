import {describe, expect, it, vi} from "vitest";
import createNewSession from "../../../../src/backend/actions/authentication/createNewSession.ts";
import {mockKysely} from "../../../convenience.ts";
import {SESSION_MAX_AGE} from "../../../../src/shared/definitions/Constants.ts";

describe("createNewSession", () => {
	it("should create a new session and return a token", async() => {
		const mockDb = mockKysely();
		
		const token = await createNewSession(mockDb, 123);
		
		expect(typeof token).toBe("string");
		expect(token).toHaveLength(64); // Verify token length (based on 32 bytes in hex)
		expect(mockDb.insertInto).toHaveBeenCalledWith("Session");
		expect(mockDb.execute).toHaveBeenCalled();
	});
	it("should save the correct data when creating a session", async() => {
		const mockDate = new Date("03.04.2024 02:38 UTC")
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
		const mockDb = mockKysely();
		
		const userId = 123;
		const token = await createNewSession(mockDb, userId);
		
		expect(mockDb.values).toHaveBeenCalledWith({
			token: token,
			expires: mockDate.getTime() + SESSION_MAX_AGE,
			userId: 123,
		});
		vi.useRealTimers();
	});
});