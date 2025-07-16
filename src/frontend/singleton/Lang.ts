import strings from "@locales/strings/en.json";
import LangSource from "../../shared/LangSource.ts";

export type LangKey = keyof typeof strings;

class LangClass {
	private langSource: LangSource = {
		strings: {},
	};
	
	public init(lang: LangSource): void {
		this.langSource = lang;
	}
	public has(key: string) {
		return this.langSource.strings.hasOwnProperty(key);
	}
	
	public getDynamic(key: string): string {
		return this.get(key as LangKey);
	}
	public getWithColon(key: LangKey, ... replacers: Array<string | number>): string {
		return Lang.get("colon", Lang.get(key, ...replacers));
	}
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
}

export const Lang = new LangClass();
