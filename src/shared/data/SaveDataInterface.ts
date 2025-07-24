import PostDataStructureInterface from "../PostDataStructureInterface.ts";
import GetDataStructureInterface from "../GetDataStructureInterface.ts";

export interface SaveDataPostInterface extends PostDataStructureInterface {
	Query: {
		id?: string;
		pass?: string;
	}
	Request: {
		data: Record<string, string>;
	}
}

export interface SaveDataGetInterface extends GetDataStructureInterface {
	Query: {
		id: string;
		pass?: string;
		data: string;
	}
	Response: {}
}

