/**
 * A simple LoggerClass which provides functionality for logging messages.
 * Exists in case we want to add more functionality in the future.
 */
class LoggerClass {
	debug(text: string) {
		console.debug(`\x1b[90m${(new Date()).toLocaleTimeString()}\x1b[0m ${text}`);
	}
	log(text: string) {
		console.log(`\x1b[90m${(new Date()).toLocaleTimeString()}\x1b[0m ${text}`);
	}
	warn(text: string) {
		console.warn(`\x1b[90m${(new Date()).toLocaleTimeString()}\x1b[0m ${text}`);
	}
	error(text: string) {
		console.error(`\x1b[90m${(new Date()).toLocaleTimeString()}\x1b[0m ${text}`);
	}
}

export const Logger = new LoggerClass();