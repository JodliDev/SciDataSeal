import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export interface SaveDataInterface extends PostDataStructureInterface {
	Endpoint: "/saveData";
	Query: {
		id?: string;
		pass?: string;
	}
	Request: Record<string, string>;
}
