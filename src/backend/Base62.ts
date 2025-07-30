//Thanks to https://lowrey.me/encoding-decoding-base-62-in-es6-javascript/

const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function encodeBase62(integer: number): string {
	if (integer === 0)
		return "0";
	
	let s: string[] = [];
	while (integer > 0) {
		s = [charset[integer % 62], ...s];
		integer = Math.floor(integer / 62);
	}
	return s.join("");
}

export function decodeBase62(chars: string): number {
	return chars
		.split("")
		.reverse()
		.reduce(
			(prev, curr, i) => prev + (charset.indexOf(curr) * (62 ** i)),
			0
		)
}