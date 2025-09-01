/**
 * A simple LoggerClass which provides functionality for logging messages.
 * Exists in case we want to add more functionality in the future.
 */
class LoggerClass {
	debug(text: string) {
		console.debug(text);
	}
	log(text: string) {
		console.log(text);
	}
	warn(text: string) {
		console.warn(text);
	}
	error(text: string) {
		console.error(text);
	}
}

export const Logger = new LoggerClass();