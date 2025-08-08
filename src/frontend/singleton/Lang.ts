import strings from "@locales/strings/en.json";
import LangSource from "../../shared/LangSource.ts";
import ExceptionInterface from "../../shared/exceptions/ExceptionInterface.ts";

export type LangKey = keyof typeof strings;

/**
 * Handles language localization.
 */
class LangClass {
	private langSource: LangSource = {
		strings: {},
	};
	
	/**
	 * Initializes the instance with the provided language source.
	 *
	 * @param lang - The language source to initialize the instance with.
	 */
	public init(lang: LangSource): void {
		this.langSource = lang;
	}
	
	
	/**
	 * Checks whether the specified key exists in the strings object of the language source.
	 *
	 * @param key - The key to check for existence.
	 * @return Returns true if the key exists, otherwise false.
	 */
	public has(key: string): boolean {
		return this.langSource.strings.hasOwnProperty(key);
	}
	
	/**
	 * Mostly exists for typing. Uses {@link Lang.get()}.
	 *
	 * @param key - The key for the string to retrieve from the language source.
	 * @param replacers - Optional replacements for placeholders within the retrieved string.
	 * Placeholders in the format `%n$s` or `%n$d` are replaced in order.
	 * @return The localized string with any applicable placeholders replaced, or the key itself if the key is not found.
/**
	 */
	public getDynamic(key: string, ... replacers: Array<string | number>): string {
		return this.get(key as LangKey, ...replacers);
	}
	
	/**
	 * Uses {@link Lang.get()} but also adds a localized colon to the output.
	 *
	 * @param key - The key for the string to retrieve from the language source.
	 * @param replacers - Optional replacements for placeholders within the retrieved string.
	 * Placeholders in the format `%n$s` or `%n$d` are replaced in order.
	 * @return {string} The localized string with an added colon.
	 */
	public getWithColon(key: LangKey, ... replacers: Array<string | number>): string {
		return Lang.get("colon", Lang.get(key, ...replacers));
	}
	
	/**
	 * Retrieves a localized string associated with the given key and optionally replaces placeholders within the string.
	 *
	 * @param key - The key for the string to retrieve from the language source.
	 * @param replacers - Optional replacements for placeholders within the retrieved string.
	 * Placeholders in the format `%n$s` or `%n$d` are replaced in order.
	 * @return The localized string with any applicable placeholders replaced, or the key itself if the key is not found.
	 */
	public get(key: LangKey, ... replacers: Array<string | number>): string {
		let value: string;
		if(this.langSource.strings.hasOwnProperty(key))
			value = this.langSource.strings[key];
		else {
			this.langSource.strings[key] = key;
			console.warn(`Lang: ${key} does not exist`);
			return key;
		}
		
		if(replacers.length) {
			let i = 1;
			for(const replace of replacers) {
				let search: string;
				switch(typeof replace) {
					case "number":
						search = `%${i++}$d`;
						break;
					case "string":
						search = `%${i++}$s`;
						break;
				}
				value = value.replaceAll(search, replace?.toString() ?? "");
			}
			return value;
		}
		else
			return value;
	}
	
	/**
	 * Processes the provided error and returns a formatted error message.
	 *
	 * @param error - The error to process, which can be of any type.
	 * @return A formatted string describing the error. If the error contains a message, it formats it dynamically.
	 * Otherwise, it returns a default unknown error message or the stringified error.
	 */
	public getError(error: unknown): string {
		const knownError = error as ExceptionInterface;
		return knownError?.message
			? Lang.getDynamic(knownError.message, ...(knownError.values ?? []))
			: (error ? JSON.stringify(error) : Lang.get("errorUnknown"));
	}
}

/**
 * Handles language localization.
 * @see LangClass
 */
export const Lang = new LangClass();
