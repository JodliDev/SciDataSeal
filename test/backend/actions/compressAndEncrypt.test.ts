import {describe, expect, it} from "vitest";
import {compressAndEncrypt, decompressAndDecrypt} from "../../../src/backend/actions/compressAndEncrypt.ts";
import {randomBytes} from "crypto";

describe("compressAndEncrypt", () => {
	it("should compress and encrypt the data correctly", () => {
		const data = "This is a test string for compression and encryption!";
		const dataKey = randomBytes(32).toString("base64url");
		const encrypted = compressAndEncrypt(data, dataKey);
		const decryptedData = decompressAndDecrypt(encrypted, dataKey);
		
		expect(decryptedData).toEqual(data);
	});
	
	it("should return a different encrypted value for the same input but different keys", () => {
		const data = "Sample data";
		const dataKey1 = randomBytes(32).toString("base64url");
		const dataKey2 = randomBytes(32).toString("base64url");
		
		const encrypted1 = compressAndEncrypt(data, dataKey1);
		const encrypted2 = compressAndEncrypt(data, dataKey2);
		
		expect(encrypted1).not.toEqual(encrypted2);
	});
	
	it("should return a different encrypted value for the same key but different inputs", () => {
		const data1 = "Sample data 1";
		const data2 = "Sample data 2";
		const dataKey = randomBytes(32).toString("base64url");
		
		const encrypted1 = compressAndEncrypt(data1, dataKey);
		const encrypted2 = compressAndEncrypt(data2, dataKey);
		
		expect(encrypted1).not.toEqual(encrypted2);
	});
	
	it("should throw an error for an invalid key size", () => {
		const data = "Invalid key test";
		const invalidDataKey = randomBytes(16).toString("base64url"); // 16 bytes instead of 32
		
		expect(() => compressAndEncrypt(data, invalidDataKey)).toThrowError();
	});
});

describe("decompressAndDecrypt", () => {
	it("should throw an error for tampered encrypted data", () => {
		const data = "Original data";
		const dataKey = randomBytes(32).toString("base64url");
		const encryptedData = compressAndEncrypt(data, dataKey);
		
		// Tamper the encrypted data
		const tamperedData = encryptedData.substring(0, encryptedData.length - 2) + "==";
		
		expect(() => decompressAndDecrypt(tamperedData, dataKey)).toThrowError();
	});
	
	it("should throw an error when using an incorrect key for decryption", () => {
		const data = "Sensitive data";
		const correctKey = randomBytes(32).toString("base64url");
		const incorrectKey = randomBytes(32).toString("base64url");
		const encryptedData = compressAndEncrypt(data, correctKey);
		
		expect(() => decompressAndDecrypt(encryptedData, incorrectKey)).toThrowError();
	});
	
	it("should throw an error when decrypting with an invalid key size", () => {
		const data = "Key size validation";
		const invalidKey = randomBytes(16).toString("base64url"); // 16 bytes instead of 32
		const validKey = randomBytes(32).toString("base64url");
		const encryptedData = compressAndEncrypt(data, validKey);
		
		expect(() => decompressAndDecrypt(encryptedData, invalidKey)).toThrowError();
	});
});