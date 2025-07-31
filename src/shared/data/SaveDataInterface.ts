import PostDataStructureInterface from "../PostDataStructureInterface.ts";
import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface SaveDataPostInterface extends PostDataStructureInterface {
	Endpoint: "/saveData";
	Query: {
		id?: string;
		pass?: string;
	}
	Request: Record<string, string>;
}

export interface SaveDataGetInterface extends GetDataStructureInterface {
	Endpoint: "/saveData";
	Query: {
		id: string;
		pass?: string;
		data: string;
	}
	Response: {}
}

