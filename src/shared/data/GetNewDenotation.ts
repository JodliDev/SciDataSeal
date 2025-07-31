import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetNewDenotation extends GetDataStructureInterface {
	Query: {
		blockchainAccountId: string;
	}
	Response: {
		denotation: number
	}
}

