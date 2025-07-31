import GetDataStructureInterface from "../GetDataStructureInterface.ts";
import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export interface ListQuestionnaireDataPostInterface extends PostDataStructureInterface {
	Endpoint: "/listQuestionnaireData";
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
	Endpoint: "/listQuestionnaireData";
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

