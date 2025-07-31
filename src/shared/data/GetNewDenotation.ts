import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface GetNewDenotation extends GetDataStructureInterface {
	Endpoint: "/getNewDenotation";
	Query: {
		blockchainAccountId: string;
	}
	Response: {
		denotation: number
	}
}

