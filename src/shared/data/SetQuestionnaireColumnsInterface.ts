import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export interface SetQuestionnaireColumnsInterface extends PostDataStructureInterface {
	Endpoint: "/setQuestionnaireColumns";
	Query: {
		id?: string;
		pass?: string;
	}
	Request: {
		columns: string[];
	}
}

