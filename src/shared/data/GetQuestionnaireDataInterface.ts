import GetDataStructureInterface from "../GetDataStructureInterface.ts";
import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export interface GetQuestionnaireDataPostInterface extends PostDataStructureInterface {
	Endpoint: "/getQuestionnaireData";
	Request: {
		blockchainType: string;
		publicKey: string;
		denotation: number;
		dataKey: string;
	}
	Response: {
		csv: string;
	}
}

export interface GetQuestionnaireDataGetInterface extends GetDataStructureInterface {
	Endpoint: "/getQuestionnaireData";
	Query: {
		blockchainType: string;
		publicKey: string;
		denotation: string;
		dataKey: string;
	}
	Response: {
		csv: string
	}
}

