import {encodeBase62} from "../Base62.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Converts a numerical denotation into a base-62 encoded, fixed-length string.
 * Pads the result with spaced to ensure it is exactly two characters long.
 * Throws an error if the resulting denotation exceeds two characters.
 *
 * @param intDenotation - The numerical denotation to encode as a string.
 * @return The base-62 encoded string representation of the input denotation, padded to exactly two characters.
 * @throws {TranslatedException} If the resulting denotation exceeds two characters.
 */
export default function generateStringDenotation(intDenotation: number): string {
	const denotation = encodeBase62(intDenotation).padStart(2, " ");
	if(denotation.length > 2) //equals to 3843
		throw new TranslatedException("errorDenotationIsTooLarge");
	return denotation;
}