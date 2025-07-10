import {describe, expect, it, vi} from 'vitest';
import LangProvider from "../../src/backend/LangProvider.ts";
import stringsEn from "@locales/strings/en.json";
import LangSource from "../../src/shared/LangSource.ts";

describe('LangProvider', () => {
	const stringsDe = {greeting: "Guten Tag"};
	
	// en.json is not imported dynamically. So it wont get caught by doMock
	
	it("should return default (English) strings if requested language is not found", async() => {
		vi.doMock("@locales/strings/nope.json", () => Promise.reject(new Error("Locale not found")));
		
		const langProvider = new LangProvider();
		const result = await langProvider.get("nope");
		expect(result).toBe(JSON.stringify({strings: stringsEn} satisfies LangSource));
	});
	
	it("should return English strings when asked for en", async() => {
		const langProvider = new LangProvider();
		const result = await langProvider.get("en");
		expect(result).toBe(JSON.stringify({strings: stringsEn} satisfies LangSource));
	});
	
	it("should fill missing values from default (English) language", async() => {
		vi.doMock("@locales/strings/de.json", () => Promise.resolve(stringsDe));
		const langProvider = new LangProvider();
		const result = await langProvider.get("de");
		expect(result).toBe(
			JSON.stringify({
				strings: {...stringsEn, ...stringsDe}
			} satisfies LangSource)
		);
	});
});