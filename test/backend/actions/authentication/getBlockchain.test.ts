import {describe, expect, it} from "vitest";
import getBlockchain from "../../../../src/backend/actions/authentication/getBlockchain.ts";
import SolanaTest from "../../../../src/backend/blockchains/SolanaTest.ts";
import TranslatedException from "../../../../src/shared/exceptions/TranslatedException.ts";

describe("getBlockchain", () => {
	it("should return an instance of SolanaTest when type is 'solanaTest'", () => {
		const result = getBlockchain("solanaTest");
		expect(result).toBeInstanceOf(SolanaTest);
	});
	
	it("should throw TranslatedException when type is unknown", () => {
		expect(() => getBlockchain("unknownType")).toThrow(TranslatedException);
		expect(() => getBlockchain("unknownType")).toThrowError(
			new TranslatedException("errorFaultyData", "blockchainType")
		);
	});
});