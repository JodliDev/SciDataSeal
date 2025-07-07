import LangSource from "../shared/LangSource.ts";
import stringsEn from "@locales/strings/en.json";
import locales from "@locales/locales.json";

export default class LangProvider {
	private cache: Record<string, string> = {
		en: JSON.stringify(
			{
				strings: stringsEn
			} satisfies LangSource
		)
	};
	
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