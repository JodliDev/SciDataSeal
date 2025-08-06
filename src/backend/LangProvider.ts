import LangSource from "../shared/LangSource.ts";
import stringsEn from "@locales/strings/en.json";
import locales from "@locales/locales.json";

/**
 * The LangProvider class is responsible for managing and providing localized language resources.
 * It maintains a cache of language data and dynamically loads additional languages as needed.
 */
export default class LangProvider {
	/**
	 * A cache object that maps language codes to their respective serialized JSON string representations.
	 * Each key in the cache represents a language code (e.g., "en"), and the value is a stringified version
	 * of a corresponding localized data structure that conforms to the `LangSource` type.
	 *
	 * The cache is initially populated with localized data for the English language, stored under the "en" key.
	 */
	private cache: Record<string, string> = {
		en: JSON.stringify(
			{
				strings: stringsEn
			} satisfies LangSource
		)
	};
	
	/**
	 * Retrieves the language data for the specified language code. If the language data is not cached, it fetches the data,
	 * caches it, and then returns the corresponding string.
	 *
	 * @param langCode - The language code for which data is requested.
	 * @return A promise that resolves to the cached or fetched language data as a string.
	 */
	public async get(langCode: string): Promise<string> {
		if(!this.cache.hasOwnProperty(langCode)) {
			if(!locales.hasOwnProperty(langCode))
				return this.cache["en"];
			
			this.cache[langCode] = JSON.stringify(
				{
					strings: {...stringsEn, ...await import(`@locales/strings/${langCode}.json`)},
				} satisfies LangSource
			);
		}
		return this.cache[langCode];
	}
}