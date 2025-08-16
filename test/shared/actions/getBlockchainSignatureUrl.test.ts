import {describe, expect, it} from "vitest";
import getBlockchainSignatureUrl from "../../../src/shared/actions/getBlockchainSignatureUrl.ts";

describe("getBlockchainSignatureUrl", () => {
	it("should return the correct Solana Testnet URL", () => {
		const type = "solanaTest";
		const signatureId = "abc123";
		const result = getBlockchainSignatureUrl(type, signatureId);
		expect(result).toBe("https://explorer.solana.com/tx/abc123?cluster=devnet");
	});
	
	it("should return the correct Solana Mainnet URL", () => {
		const type = "solana";
		const signatureId = "xyz789";
		const result = getBlockchainSignatureUrl(type, signatureId);
		expect(result).toBe("https://explorer.solana.com/tx/xyz789");
	});
	
	it("should throw an error for unsupported blockchain types", () => {
		const type = "ethereum";
		const signatureId = "def456";
		expect(() => getBlockchainSignatureUrl(type, signatureId)).toThrow(
			"Unsupported blockchain type"
		);
	});
});