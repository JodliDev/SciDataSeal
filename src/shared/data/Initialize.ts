import PostDataStructureInterface from "../PostDataStructureInterface.ts";

export default interface Initialize extends PostDataStructureInterface {
	Request: {
		username: string;
		password: string;
	}
	Response: {
		userId: number;
	}
}

