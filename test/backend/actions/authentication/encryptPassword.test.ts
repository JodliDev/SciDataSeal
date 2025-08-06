import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import encryptPassword from "../../../../src/backend/actions/authentication/encryptPassword.ts";
import bcrypt from "bcrypt";



describe("encryptPassword", () => {
	beforeAll(() => {
		vi.mock("bcrypt", () => ({
			default: {
				genSalt: vi.fn(() => Promise.resolve("mock_salt")),
				hash: vi.fn((password, salt) => Promise.resolve(`hashed_${password}_with_${salt}`)),
			}
		}));
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
	
	it("should generate a hashed password using bcrypt", async() => {
		const password = "testPassword";
		const mockSalt = "mock_salt";
		const hashedPassword = await encryptPassword(password);
		
		expect(bcrypt.genSalt).toHaveBeenCalledOnce();
		expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
		expect(hashedPassword).toBe(`hashed_${password}_with_${mockSalt}`);
	});
});