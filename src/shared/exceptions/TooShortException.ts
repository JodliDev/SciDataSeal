import TranslatedException from "./TranslatedException.ts";

export default class TooShortException extends TranslatedException {
	constructor(field: string, length: number) {
		super("errorTooShort", field, length);
	}
}