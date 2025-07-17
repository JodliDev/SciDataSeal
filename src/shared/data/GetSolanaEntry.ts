import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetSolanaEntry extends GetDataStructureInterface {
	Response: {
		entries: string[]
	}
}

