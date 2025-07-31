import PostDataStructureInterface from "../PostDataStructureInterface.ts";
import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface SetQuestionnaireColumnsPostInterface extends PostDataStructureInterface {
	Endpoint: "/setQuestionnaireColumns";
	Query: {
		id?: string;
		pass?: string;
	}
	Request: {
		columns: string[];
	}
}

export interface SetQuestionnaireColumnsGetInterface extends GetDataStructureInterface {
	Endpoint: "/setQuestionnaireColumns";
	Query: {
		id: string;
		pass?: string;
		columns: string;
	}
	Response: {}
}

