import {deflateSync, inflateSync} from "node:zlib";
import {createCipheriv, createDecipheriv, randomBytes} from "node:crypto";

/**
 * Compresses a given string and encrypts it using the provided key.
 *
 * @param data - The string to be compressed and encrypted.
 * @param dataKey - The encryption key encoded in base64url format.
 * @return The compressed and encrypted data, encoded as a base64url string.
 */
export function compressAndEncrypt(data: string, dataKey: string): string {
	//compress:
	//Thanks to https://stackoverflow.com/a/39800991
	const compressed = deflateSync(data);
	
	//encode:
	//Thanks to https://stackoverflow.com/a/78687217
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", Buffer.from(dataKey, "base64url"), iv);
	const update = cipher.update(compressed);
	const final = cipher.final();
	const encrypted = Buffer.concat([iv, update, final]);
	
	return encrypted.toString("base64url");
}

/**
 * Decompresses and decrypts a given string encoded in base64url format.
 *
 * @param data - The base64url encoded string that contains the encrypted and compressed data.
 * @param dataKey - The base64url encoded encryption key used for decryption.
 * @return The decompressed and decrypted string.
 */
export function decompressAndDecrypt(data: string, dataKey: string): string {
	//decode:
	const ivCiphertext = Buffer.from(data, "base64url");
	const iv = ivCiphertext.subarray(0, 16);
	const ciphertext = ivCiphertext.subarray(16);
	const cipher = createDecipheriv("aes-256-cbc", Buffer.from(dataKey, "base64url"), iv);
	const decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
	
	//decompress:
	return inflateSync(decrypted).toString();
}