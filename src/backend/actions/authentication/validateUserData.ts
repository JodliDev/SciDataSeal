import {PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH} from "../../../shared/definitions/Constants.ts";
import TooShortException from "../../../shared/exceptions/TooShortException.ts";
import isValidBackendString from "../../../shared/actions/isValidBackendString.ts";
import TranslatedException from "../../../shared/exceptions/TranslatedException.ts";

export default function validateUserData(username: string, password?: string) {
	if(username.length < USERNAME_MIN_LENGTH)
		throw new TooShortException("username", USERNAME_MIN_LENGTH);
	if(password && password.length < PASSWORD_MIN_LENGTH)
		throw new TooShortException("password", PASSWORD_MIN_LENGTH);
	if(!isValidBackendString(username))
		throw new TranslatedException("errorFaultyData", "username");
}