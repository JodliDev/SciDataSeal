/**
 * Validates whether the provided string contains valid characters.
 *
 * @param text - The string to validate.
 * @return Returns true if the string is valid, otherwise false.
 */
export default function isValidBackendString(text: string): boolean {
	return /^[\w\s\-_]+$/.test(text);
}