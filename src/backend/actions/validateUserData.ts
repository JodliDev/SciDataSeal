import {PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH} from "../../shared/definitions/Constants.ts";
import TooShortException from "../../shared/exceptions/TooShortException.ts";
import isValidBackendString from "../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Validates user data such as username and password.
 *
 * @param username - The username to be validated. It must meet the minimum length requirement and be a valid backend string.
 * @param password - Optional password to be validated. If provided, it must meet the minimum length requirement.
 * @throws {TooShortException} If the username or password is shorter than the required minimum length.
 * @throws {TranslatedException} If the username is not a valid backend string.
 */
export default function validateUserData(username: string, password?: string): void {
	if(username.length < USERNAME_MIN_LENGTH)
		throw new TooShortException("username", USERNAME_MIN_LENGTH);
	if(password && password.length < PASSWORD_MIN_LENGTH)
		throw new TooShortException("password", PASSWORD_MIN_LENGTH);
	if(!isValidBackendString(username))
		throw new TranslatedException("errorFaultyData", "username");
}