//Thanks to https://lowrey.me/encoding-decoding-base-62-in-es6-javascript/

const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Converts a given integer into a Base62-encoded string representation.
 *
 * @param integer The integer to be encoded into Base62 format.
 * @return The Base62-encoded string representation of the given integer.
 */
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

/**
 * Decodes a Base62 encoded string into its numeric value.
 *
 * @param chars - The Base62 encoded string to decode.
 * @return The numeric value represented by the Base62 string.
 */
export function decodeBase62(chars: string): number {
	return chars
		.split("")
		.reverse()
		.reduce(
			(prev, curr, i) => prev + (charset.indexOf(curr) * (62 ** i)),
			0
		)
}