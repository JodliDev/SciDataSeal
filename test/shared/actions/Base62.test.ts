import {describe, expect, it} from "vitest";
import {decodeBase62, encodeBase62} from "../../../src/shared/actions/Base62.ts";

describe("encodeBase62", () => {
	it("encodes 0 to '0'", () => {
		expect(encodeBase62(0)).toBe("0");
	});

	it("encodes 1 to '1'", () => {
		expect(encodeBase62(1)).toBe("1");
	});
	
	it("encodes 61 to 'Z'", () => {
		expect(encodeBase62(61)).toBe("Z");
	});
	
	it("encodes 62 to '10'", () => {
		expect(encodeBase62(62)).toBe("10");
	});
	
	it("encodes 3843 to 'ZZ'", () => {
		expect(encodeBase62(3843)).toBe("ZZ");
	});
	it("encodes 3844 to '100'", () => {
		expect(encodeBase62(3844)).toBe("100");
	});

	it("encodes 987654321 to '14Q60p'", () => {
		expect(encodeBase62(987654321)).toBe("14Q60p");
	});
});

describe("decodeBase62", () => {
	it("decodes '0' to 0", () => {
		expect(decodeBase62("0")).toBe(0);
	});
	
	it("decodes '1' to 1", () => {
		expect(decodeBase62("1")).toBe(1);
	});
	
	it("decodes 'Z' to 61", () => {
		expect(decodeBase62("Z")).toBe(61);
	});
	
	it("decodes '10' to 62", () => {
		expect(decodeBase62("10")).toBe(62);
	});
	
	it("decodes 'ZZ' to 3843", () => {
		expect(decodeBase62("ZZ")).toBe(3843);
	});
	
	it("decodes '100' to 3844", () => {
		expect(decodeBase62("100")).toBe(3844);
	});
	
	it("decodes '14Q60p' to 987654321", () => {
		expect(decodeBase62("14Q60p")).toBe(987654321);
	});
});