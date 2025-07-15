import GetDataStructure from "./GetDataStructure.ts";

export default interface GetSolanaEntry extends GetDataStructure {
	Response: {
		entries: string[]
	}
}

