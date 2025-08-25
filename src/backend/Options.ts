import {FrontendOptions} from "../shared/FrontendOptions.ts";

/**
 * The `OptionsClass` represents a configuration object with predefined and dynamically adjustable
 * properties that will be populated through environment variables or command-line arguments.
 */
class OptionsClass implements FrontendOptions {
	public readonly mode: "production" | "development" = "development";
	public readonly port: number = 19419;
	public readonly root: string = process.cwd();
	public readonly urlPath: string = "/";
	public readonly schedulerHourOfDay: number = 3;
	public isInit: boolean = false;
	
	constructor() {
		const keys = Object.keys(this);
		
		//read environment variables:
		
		for(const key of keys) {
			if(process.env[key])
				this.setValue(key, process.env[key]);
		}
		
		//read console arguments:
		
		for(const val of process.argv) {
			for(const key of keys) {
				const match = val.match(`^${key}=(.+)$`);
				if(match)
					this.setValue(key, match[1]);
			}
		}
		
		if(!this.urlPath.endsWith("/"))
			this.urlPath += "/";
	}
	/**
	 * Sets the value of a specified option.
	 *
	 * @param key - The name of the option to be set.
	 * @param value - The value to assign to the specified option.
	 */
	private setValue(key: string, value: string): void {
		const type = typeof this[key as keyof this];
		switch(type) {
			case "string":
				this[key as keyof this] = value as any;
				break;
			case "number":
				this[key as keyof this] = parseInt(value) as any;
				break;
			case "boolean":
				this[key as keyof this] = !!value as any;
				break;
		}
	}
}

export const Options = new OptionsClass();

/**
 * Only used for testing
 */
export function createNewOptionsForTest(): OptionsClass {
	return new OptionsClass();
}