import PostDataStructureInterface from "../PostDataStructureInterface.ts";
import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface SetStudyColumnsPostInterface extends PostDataStructureInterface {
	Query: {
		id?: string;
		pass?: string;
	}
	Request: {
		columns: string[];
	}
}

export interface SetStudyColumnsGetInterface extends GetDataStructureInterface {
	Query: {
		id: string;
		pass?: string;
		columns: string;
	}
	Response: {}
}

