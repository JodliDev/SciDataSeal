import bcrypt from "bcrypt";

/**
 * Encrypts the provided plain text password using bcrypt.
 *
 * @param password - The plain text password to be encrypted.
 * @return A promise that resolves to the hashed password.
 */
export default async function encryptPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(password, salt);
}