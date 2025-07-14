import {describe, expect, it, vi, beforeEach} from 'vitest';
import {Lang, LangKey} from "../../src/frontend/Lang";

describe("Lang", () => {
	beforeEach(() => {
		Lang.init({
			strings: {
				colon: '%1$s: ',
				hello: "Hello, World",
				greet: "Hello, %1$s",
				greetMultiple: "Hello %1$s, %2$s and %3$s. I greet all %4$d of you. Especially %2$s!",
			},
		});
	});
	
	describe("has()", () => {
		it("should return true for existing keys", () => {
			expect(Lang.has("hello")).toBe(true);
		});
		
		it("should return false for non-existing keys", () => {
			expect(Lang.has("nonexistent")).toBe(false);
		});
	})
	
	describe("get()", () => {
		it("should return the value for an existing key", () => {
			expect(Lang.get("hello" as LangKey)).toBe("Hello, World");
		});
		
		it("should return the key and log a warning for a non-existing key", () => {
			vi.spyOn(console, "warn").mockImplementation(() => {});
			
			expect(Lang.get("missingKey" as LangKey)).toBe("missingKey");
			expect(console.warn).toHaveBeenCalledWith("Lang: missingKey does not exist");
		});
		
		it("should replace placeholders with values", () => {
			expect(Lang.get("greet" as LangKey, "Camina")).toBe('Hello, Camina');
		});
		
		it("should replace multiple placeholders with values", () => {
			expect(Lang.get("greetMultiple" as LangKey, "Steven", "Camina", "Wes", 3)).toBe('Hello Steven, Camina and Wes. I greet all 3 of you. Especially Camina!');
		});
	})
	
	describe("getDynamic()", () => {
		it("should use Lang.get() with the correct key", () => {
			vi.spyOn(Lang, "get");
			
			expect(Lang.getDynamic("hello")).toBe("Hello, World");
			expect(Lang.get).toHaveBeenCalledWith("hello");
		});
	})
	
	describe("getWithColon()", () => {
		it("should return the correct value with an added colon", () => {
			expect(Lang.getWithColon("hello" as LangKey)).toBe('Hello, World: ');
		});
		
		
		it("should replace placeholders in both the prefix and the key value", () => {
			expect(Lang.getWithColon("greet" as LangKey, "Camina")).toBe("Hello, Camina: ");
		});
	})
})