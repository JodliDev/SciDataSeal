import {describe, expect, test} from "vitest";
import validateUserData from "../../../src/backend/actions/validateUserData.ts";
import TooShortException from "../../../src/shared/exceptions/TooShortException.ts";
import {PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH} from "../../../src/shared/definitions/Constants.ts";
import TranslatedException from "../../../src/shared/exceptions/TranslatedException.ts";

describe("validateUserData", () => {
	test("should throw TooShortException if username is too short", () => {
		const username = "us";
		expect(() => validateUserData(username)).toThrowError(
			new TooShortException("username", USERNAME_MIN_LENGTH)
		);
	});
	
	test("should throw TooShortException if password is too short", () => {
		const username = "validUser";
		const password = "pass";
		expect(() => validateUserData(username, password)).toThrowError(
			new TooShortException("password", PASSWORD_MIN_LENGTH)
		);
	});
	
	test("should throw TranslatedException if username contains invalid characters", () => {
		const username = "invalid$user";
		expect(() => validateUserData(username)).toThrowError(
			new TranslatedException("errorFaultyData", "username")
		);
	});
	
	test("should not throw if username and password are valid", () => {
		const username = "validUser";
		const password = "validPass123";
		expect(() => validateUserData(username, password)).not.toThrow();
	});
	
	test("should not throw if only username is provided and valid", () => {
		const username = "validUser";
		expect(() => validateUserData(username)).not.toThrow();
	});
});