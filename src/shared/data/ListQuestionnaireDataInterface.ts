import GetDataStructureInterface from "../GetDataStructureInterface.ts";
import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export interface ListQuestionnaireDataPostInterface extends PostDataStructureInterface {
	Request: {
		blockchainType: string;
		publicKey: string;
		denotation: number;
		dataKey: string;
	}
	Response: {
		data: string[][];
	}
}

export interface ListQuestionnaireDataGetInterface extends GetDataStructureInterface {
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

