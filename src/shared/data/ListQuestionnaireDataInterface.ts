import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export default interface ListQuestionnaireDataInterface extends GetDataStructureInterface {
	Query: {
		blockchainType: string;
		publicKey: string;
		denotation: string;
		dataKey: string;
	}
	Response: {
		data: string[][];
	}
}

