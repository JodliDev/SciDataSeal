import {encodeBase62} from "../Base62.ts";

export default function generateStringDenotation(intDenotation: number): string {
	const denotation = encodeBase62(intDenotation).padStart(2, " ");
	if(denotation.length > 2) //equals to 3843
		throw new Error("Denotation is too large");
	return denotation;
}